// lib/pairwise.ts
// Bradley-Terry Pairwise Comparison Engine with Minorization-Maximization (MM)
// Authoritative specification: JUDGING.md §5 (Bonus +5)

export interface PairwiseComparison {
  winner_id: string;
  loser_id: string;
  judge_id?: string;
}

export interface BradleyTerryItem {
  project_id: string;
  rank: number;
  pi: number;           // Latent quality parameter (sum normalized)
  log_ability: number;  // ln(pi)
  wins: number;
  total_matches: number;
}

export interface BradleyTerryResult {
  converged: boolean;
  iterations: number;
  items: BradleyTerryItem[];
  predictProbability: (projectA: string, projectB: string) => number;
}

/**
 * Computes latent skill scores and win probabilities using the Bradley-Terry model.
 * Mathematical derivation per JUDGING.md §5:
 * P(i > j) = pi_i / (pi_i + pi_j)
 * Iterative MM update with Bayesian pseudo-count regularization (prior = 0.25):
 * pi_i^(t+1) = (W_i + prior) * [ sum_{j != i} ((n_ij + 2*prior) / (pi_i^(t) + pi_j^(t))) ]^(-1)
 */
export function computeBradleyTerry(
  projectIds: string[],
  comparisons: PairwiseComparison[],
  maxIterations = 200,
  tolerance = 1e-5
): BradleyTerryResult {
  const M = projectIds.length;
  if (M === 0) {
    return {
      converged: true,
      iterations: 0,
      items: [],
      predictProbability: () => 0.5,
    };
  }

  const idToIndex = new Map<string, number>();
  projectIds.forEach((id, idx) => idToIndex.set(id, idx));

  // Initialize comparison counts:
  // w[i][j]: number of times project i beat project j
  const w: number[][] = Array.from({ length: M }, () => Array(M).fill(0));
  const n: number[][] = Array.from({ length: M }, () => Array(M).fill(0));
  const wins: number[] = Array(M).fill(0);
  const totalMatches: number[] = Array(M).fill(0);

  // Bayesian prior pseudo-count for regularized MM convergence
  const PRIOR = 0.25;

  for (const c of comparisons) {
    const i = idToIndex.get(c.winner_id);
    const j = idToIndex.get(c.loser_id);
    if (i !== undefined && j !== undefined && i !== j) {
      w[i][j] += 1;
      wins[i] += 1;
      totalMatches[i] += 1;
      totalMatches[j] += 1;
    }
  }

  for (let i = 0; i < M; i++) {
    for (let j = 0; j < M; j++) {
      if (i !== j) {
        n[i][j] = w[i][j] + w[j][i];
      }
    }
  }

  // Initial latent parameter: uniform 1 / M
  let pi: number[] = Array(M).fill(1.0 / M);
  let converged = false;
  let iter = 0;

  for (iter = 0; iter < maxIterations; iter++) {
    const nextPi: number[] = Array(M).fill(0);

    for (let i = 0; i < M; i++) {
      let denomSum = 0;
      for (let j = 0; j < M; j++) {
        if (i !== j) {
          const effectiveComparisons = n[i][j] + 2 * PRIOR;
          denomSum += effectiveComparisons / (pi[i] + pi[j]);
        }
      }

      const effectiveWins = wins[i] + PRIOR;
      nextPi[i] = effectiveWins / denomSum;
    }

    // Normalize sum(pi) = 1.0 for scale identifiability
    const sumPi = nextPi.reduce((acc, v) => acc + v, 0);
    const normalizedNext = nextPi.map((v) => v / sumPi);

    // Compute max delta between consecutive iterations
    let maxDelta = 0;
    for (let i = 0; i < M; i++) {
      const delta = Math.abs(normalizedNext[i] - pi[i]);
      if (delta > maxDelta) maxDelta = delta;
    }

    pi = normalizedNext;

    if (maxDelta < tolerance) {
      converged = true;
      iter++;
      break;
    }
  }

  // Map to results and rank descending by skill parameter pi
  const piMap = new Map<string, number>();
  projectIds.forEach((id, idx) => piMap.set(id, pi[idx]));

  const rawItems = projectIds.map((id, idx) => ({
    project_id: id,
    pi: pi[idx],
    log_ability: Number(Math.log(pi[idx]).toFixed(4)),
    wins: wins[idx],
    total_matches: totalMatches[idx],
  }));

  rawItems.sort((a, b) => b.pi - a.pi);

  const items: BradleyTerryItem[] = rawItems.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    pi: Number(item.pi.toFixed(6)),
  }));

  const predictProbability = (projectA: string, projectB: string): number => {
    const piA = piMap.get(projectA);
    const piB = piMap.get(projectB);
    if (!piA || !piB) return 0.5;
    return Number((piA / (piA + piB)).toFixed(4));
  };

  return {
    converged,
    iterations: iter,
    items,
    predictProbability,
  };
}
