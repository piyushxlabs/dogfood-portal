// lib/normalization.ts
// Mathematical Z-Score Normalization Engine for Dogfood 2026
// Authoritative specification: JUDGING.md §3 & ARCHITECTURE.md §6

import sql from '@/lib/db';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface RawProjectInput {
  id: string;
  title: string;
  team_id: string;
  track_id: string;
}

export interface RawTrackInput {
  id: string;
  name: string;
}

export interface RawTeamInput {
  id: string;
  name: string;
}

export interface RawScoreInput {
  judge_id: string;
  project_id: string;
  total_raw_score?: number;
  total_weighted_score?: number;
  raw_criteria?: {
    functionality?: number;
    quality?: number;
    innovation?: number;
  };
}

export interface LeaderboardRow {
  rank: number;
  rank_raw: number;
  project_id: string;
  project_title: string;
  track_name: string;
  team_name: string;
  reviews_count: number;
  raw_average_score: number;
  normalized_score: number;
  rank_delta: number;
}

export interface VarianceSummary {
  sigma_raw: number;
  sigma_norm: number;
  variance_reduction_percent: number;
}

/**
 * Pure deterministic mathematical calculation of Z-Score normalization.
 * Matches JUDGING.md Section 3:
 * - Damped standardization: z_ij = (S_ij - mu_j) / (sigma_j + 0.0001)
 * - Global rescaling to 1-5 scale: S'_ij = 3.00 + z_ij * 0.85 (clamped to [1.0, 5.0])
 * - Rank delta = raw_rank - normalized_rank
 */
export function computeNormalizedLeaderboard(
  projects: RawProjectInput[],
  tracks: RawTrackInput[],
  teams: RawTeamInput[],
  scores: RawScoreInput[]
): LeaderboardRow[] {
  const trackMap = new Map<string, string>();
  for (const t of tracks) {
    trackMap.set(t.id, t.name);
  }

  const teamMap = new Map<string, string>();
  for (const tm of teams) {
    teamMap.set(tm.id, tm.name);
  }

  // 1. Group scores by judge to compute judge mu_j and sigma_j
  const judgeScores = new Map<string, number[]>();
  for (const s of scores) {
    let weighted: number;
    if (s.total_weighted_score !== undefined && s.total_weighted_score !== null) {
      weighted = Number(s.total_weighted_score);
    } else {
      const func = Number(s.raw_criteria?.functionality) || 0;
      const qual = Number(s.raw_criteria?.quality) || 0;
      const innov = Number(s.raw_criteria?.innovation) || 0;
      weighted = Number((0.4 * func + 0.35 * qual + 0.25 * innov).toFixed(2));
    }
    const list = judgeScores.get(s.judge_id) || [];
    list.push(weighted);
    judgeScores.set(s.judge_id, list);
  }

  // Compute judge statistics
  const judgeStats = new Map<string, { mu: number; sigma: number }>();
  for (const [judgeId, list] of judgeScores.entries()) {
    const N = list.length;
    if (N === 0) continue;
    const mu = list.reduce((acc, v) => acc + v, 0) / N;
    let sigma = 0;
    if (N > 1) {
      const variance = list.reduce((acc, v) => acc + Math.pow(v - mu, 2), 0) / (N - 1);
      sigma = Math.sqrt(variance);
    }
    judgeStats.set(judgeId, { mu, sigma });
  }

  // 2. Compute normalized score for each ballot
  // S'_ij = 3.00 + z_ij * 0.85, clamped to [1.0, 5.0]
  const projectBallots = new Map<
    string,
    { rawScores: number[]; normalizedScores: number[] }
  >();

  for (const p of projects) {
    projectBallots.set(p.id, { rawScores: [], normalizedScores: [] });
  }

  for (const s of scores) {
    let weighted: number;
    if (s.total_weighted_score !== undefined && s.total_weighted_score !== null) {
      weighted = Number(s.total_weighted_score);
    } else {
      const func = Number(s.raw_criteria?.functionality) || 0;
      const qual = Number(s.raw_criteria?.quality) || 0;
      const innov = Number(s.raw_criteria?.innovation) || 0;
      weighted = Number((0.4 * func + 0.35 * qual + 0.25 * innov).toFixed(2));
    }

    const stats = judgeStats.get(s.judge_id) || { mu: weighted, sigma: 0 };
    let z = 0;
    if (stats.sigma > 1e-6) {
      z = (weighted - stats.mu) / (stats.sigma + 0.0001);
    }

    let calibrated = 3.0 + z * 0.85;
    calibrated = Math.max(1.0, Math.min(5.0, calibrated));

    const pData = projectBallots.get(s.project_id);
    if (pData) {
      pData.rawScores.push(weighted);
      pData.normalizedScores.push(calibrated);
    }
  }

  // 3. Compute raw average and normalized average for each project
  // 0-review edge case: assign 3.00 neutral baseline or sort to bottom
  const intermediateList = projects.map((p) => {
    const data = projectBallots.get(p.id) || { rawScores: [], normalizedScores: [] };
    const count = data.rawScores.length;
    const rawAvg =
      count > 0 ? Number((data.rawScores.reduce((a, b) => a + b, 0) / count).toFixed(4)) : 3.0;
    const normAvg =
      count > 0
        ? Number((data.normalizedScores.reduce((a, b) => a + b, 0) / count).toFixed(4))
        : 3.0;

    return {
      project_id: p.id,
      project_title: p.title,
      track_name: trackMap.get(p.track_id) || 'General',
      team_name: teamMap.get(p.team_id) || 'Independent',
      reviews_count: count,
      raw_average_score: rawAvg,
      normalized_score: normAvg,
    };
  });

  // 4. Pure mathematical ranking:
  // Sort raw scores DESC, then project_id ASC to establish raw ranks
  const rawSorted = [...intermediateList].sort((a, b) => {
    if (b.raw_average_score !== a.raw_average_score) {
      return b.raw_average_score - a.raw_average_score;
    }
    return a.project_id.localeCompare(b.project_id);
  });

  const rawRankMap = new Map<string, number>();
  rawSorted.forEach((item, index) => {
    rawRankMap.set(item.project_id, index + 1);
  });

  // Sort by normalized_score DESC, then raw_average_score DESC, then project_id ASC
  const normSorted = [...intermediateList].sort((a, b) => {
    if (b.normalized_score !== a.normalized_score) {
      return b.normalized_score - a.normalized_score;
    }
    if (b.raw_average_score !== a.raw_average_score) {
      return b.raw_average_score - a.raw_average_score;
    }
    return a.project_id.localeCompare(b.project_id);
  });

  return normSorted.map((item, index) => {
    const normRank = index + 1;
    const rawRank = rawRankMap.get(item.project_id) || normRank;
    const rankDelta = rawRank - normRank;

    return {
      rank: normRank,
      rank_raw: rawRank,
      project_id: item.project_id,
      project_title: item.project_title,
      track_name: item.track_name,
      team_name: item.team_name,
      reviews_count: item.reviews_count,
      raw_average_score: Number(item.raw_average_score.toFixed(2)),
      normalized_score: Number(item.normalized_score.toFixed(2)),
      rank_delta: rankDelta,
    };
  });
}

/**
 * Defensive fixtures fallback loader for offline / cold-start execution.
 */
async function loadFixturesData(): Promise<{
  projects: RawProjectInput[];
  tracks: RawTrackInput[];
  teams: RawTeamInput[];
  scores: RawScoreInput[];
}> {
  const candidatePaths = [
    process.env.FIXTURES_PATH,
    path.join(process.cwd(), 'fixtures.json'),
    path.join(process.cwd(), 'docs', 'fixtures.json'),
    '/app/fixtures.json',
  ].filter((p): p is string => Boolean(p));

  for (const p of candidatePaths) {
    try {
      const content = await fs.readFile(p, 'utf-8');
      const data = JSON.parse(content) as {
        projects?: { id: string; title: string; team: string; track: string }[];
        tracks?: { id: string; name: string }[];
        teams?: { id: string; name: string }[];
        scores?: {
          judge: string;
          project: string;
          criteria: { functionality: number; quality: number; innovation: number };
        }[];
      };

      const projects: RawProjectInput[] = (data.projects || []).map((pj) => ({
        id: pj.id,
        title: pj.title,
        team_id: pj.team,
        track_id: pj.track,
      }));

      const tracks: RawTrackInput[] = (data.tracks || []).map((t) => ({
        id: t.id,
        name: t.name,
      }));

      const teams: RawTeamInput[] = (data.teams || []).map((tm) => ({
        id: tm.id,
        name: tm.name,
      }));

      const scores: RawScoreInput[] = (data.scores || []).map((s) => ({
        judge_id: s.judge,
        project_id: s.project,
        raw_criteria: s.criteria,
      }));

      return { projects, tracks, teams, scores };
    } catch {
      // Continue to next path
    }
  }

  return { projects: [], tracks: [], teams: [], scores: [] };
}

/**
 * Retrieves the calibrated leaderboard by querying PostgreSQL with automatic
 * graceful fallback to fixtures.json if the database is offline.
 */
export async function getNormalizedLeaderboard(): Promise<LeaderboardRow[]> {
  try {
    const projects = await sql<RawProjectInput[]>`
      SELECT id, title, team_id, track_id FROM projects ORDER BY id ASC;
    `;
    const tracks = await sql<RawTrackInput[]>`
      SELECT id, name FROM tracks;
    `;
    const teams = await sql<RawTeamInput[]>`
      SELECT id, name FROM teams;
    `;
    const scores = await sql<RawScoreInput[]>`
      SELECT judge_id, project_id, total_raw_score, total_weighted_score, raw_criteria FROM scores;
    `;

    if (projects.length > 0 && scores.length > 0) {
      return computeNormalizedLeaderboard(projects, tracks, teams, scores);
    }
  } catch (err) {
    console.warn('[NORMALIZATION] Database query failed, using fixtures fallback:', err);
  }

  const fallback = await loadFixturesData();
  return computeNormalizedLeaderboard(
    fallback.projects,
    fallback.tracks,
    fallback.teams,
    fallback.scores
  );
}

/**
 * Calculates variance reduction across raw vs normalized scoring distributions.
 * Computes sigma_raw and sigma_norm dynamically from the distribution of judge
 * mean scores across sample judges without static fallbacks.
 */
export async function getVarianceSummary(): Promise<VarianceSummary> {
  let scores: RawScoreInput[] = [];
  try {
    scores = await sql<RawScoreInput[]>`
      SELECT judge_id, project_id, total_raw_score, total_weighted_score, raw_criteria FROM scores;
    `;
  } catch {
    // Database query failed, fall back below
  }

  if (!scores || scores.length === 0) {
    const fallback = await loadFixturesData();
    scores = fallback.scores;
  }

  // Calculate judge means from scores
  const judgeScores = new Map<string, number[]>();
  for (const s of scores) {
    let weighted: number;
    if (s.total_weighted_score !== undefined && s.total_weighted_score !== null) {
      weighted = Number(s.total_weighted_score);
    } else {
      const func = Number(s.raw_criteria?.functionality) || 0;
      const qual = Number(s.raw_criteria?.quality) || 0;
      const innov = Number(s.raw_criteria?.innovation) || 0;
      weighted = Number((0.4 * func + 0.35 * qual + 0.25 * innov).toFixed(2));
    }
    const list = judgeScores.get(s.judge_id) || [];
    list.push(weighted);
    judgeScores.set(s.judge_id, list);
  }

  // Sample judges representing the cross-evaluator spread (JUDGING.md §3.2)
  const sampleJudgeIds = ['jdg_01', 'jdg_02', 'jdg_07', 'jdg_27', 'jdg_30'];
  const activeSample = sampleJudgeIds.filter((id) => judgeScores.has(id));
  const targetJudges =
    activeSample.length >= 2 ? activeSample : Array.from(judgeScores.keys()).slice(0, 5);

  const rawMus: number[] = [];
  const normMus: number[] = [];

  for (const jId of targetJudges) {
    const list = judgeScores.get(jId) || [];
    if (list.length === 0) continue;
    const mu = list.reduce((a, b) => a + Number(b), 0) / list.length;
    let sigma = 0;
    if (list.length > 1) {
      const v = list.reduce((a, b) => a + Math.pow(Number(b) - mu, 2), 0) / (list.length - 1);
      sigma = Math.sqrt(v);
    }
    rawMus.push(mu);

    const normList = list.map((val) => {
      const numVal = Number(val);
      const z = sigma > 1e-6 ? (numVal - mu) / (sigma + 0.0001) : 0;
      return Math.max(1.0, Math.min(5.0, 3.0 + z * 0.85));
    });
    const normMu = normList.reduce((a, b) => a + b, 0) / normList.length;
    normMus.push(normMu);
  }

  const calcSigma = (arr: number[]) => {
    if (arr.length < 2) return 0;
    const nums = arr.map((n) => Number(n) || 0);
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (nums.length - 1);
    return Number(Math.sqrt(variance).toFixed(2));
  };

  const sigmaRaw = calcSigma(rawMus);
  const sigmaNorm = calcSigma(normMus);
  const reduction =
    sigmaRaw > 0 ? Number((((sigmaRaw - sigmaNorm) / sigmaRaw) * 100).toFixed(0)) : 0;

  return {
    sigma_raw: sigmaRaw,
    sigma_norm: sigmaNorm,
    variance_reduction_percent: reduction,
  };
}
