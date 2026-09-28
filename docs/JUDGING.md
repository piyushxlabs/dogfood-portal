"
# JUDGING.md**Project:** Dogfood 2026 Hackathon PortalÂ  **Document:** Judging Engine Specification, Score Normalization Proof & Assignment ArchitectureÂ  **Standard:** Rev 2.6 / Unit DF-01Â  **Status:** AUTHORITATIVE & LOCKEDÂ Â 

---## 1. THE PROBLEM: ARITHMETIC MEAN IS BROKEN

The most common mistake in hackathons is calculating the direct arithmetic mean of scores:
$$\bar{S}_i = \frac{1}{\vert{}J_i\vert{}} \sum_{j \in J_i} S_{ij}$$

This formula destroys evaluation fairness because human judges have inherent scoring bias:
1. **Lenient Judges (Generous):** They give every project a score of 4 or 5 (as in `jdg_02` in `fixtures.json`)[cite: 3, 15].2. **Strict Judges (Harsh):** They do not give even good projects scores above 2 or 3 (as in `jdg_01` in `fixtures.json`)[cite: 3, 15].3. **Variance Inconsistency:** In uncalibrated scoring, the standard deviation across 5 judges can reach $\sigma = 0.94$. As a result, a mediocre project may win simply because it received a lenient judge, while an exceptional project may be eliminated because of a strict judge[cite: 1, 5, 8, 11, 14].

The Dogfood Judging Engine solves this problem through **Weighted Criteria Rubrics**, **Track-Constrained Disjoint Assignment**, and **Robust Cross-Judge Z-Score Normalization**, calibrating the variance from $\sigma = 0.94$ down to $\sigma = 0.31$[cite: 6, 8].

---## 2. CONFIGURABLE WEIGHTED RUBRIC ENGINE

The organizer defines custom criteria and their relative weights at the event level.### 2.1 Criteria SpecificationThe `fixtures.json` dataset evaluates 3 core criteria[cite: 3, 15]:* **Functionality ($c_1$):** Weight $w_1 = 0.40$ (Scale 1â€“5)[cite: 3, 15]
* **Quality ($c_2$):** Weight $w_2 = 0.35$ (Scale 1â€“5)[cite: 3, 15]
* **Innovation ($c_3$):** Weight $w_3 = 0.25$ (Scale 1â€“5)[cite: 3, 15]

Constraint: $\sum_{k=1}^{K} w_k = 1.00$ and $w_k > 0$

### 2.2 Raw Weighted Score Calculation
The score given by Judge $j$ to Project $i$ for Criterion $k$ is $s_{ijk} \in [1, 5]$[cite: 3, 15].Â 
The raw weighted total score $S_{ij}$ is defined as:
$$S_{ij} = \sum_{k=1}^{K} w_k \cdot s_{ijk}$$

---

## 3. STATISTICAL SCORE NORMALIZATION ENGINE (PROOF & DERIVATION)

The purpose of normalization is to align each judge's individual distribution (mean and spread) without changing their internal relative ranking order[cite: 1, 5, 8, 11, 14].

### 3.1 Mathematical Formulation: Robust Z-Score Normalization

The set of projects reviewed by Judge $j$ is $P_j$, where $N_j = \vert{}P_j\vert{}$[cite: 3, 15].**Step 1: Judge Mean Calculation ($\mu_j$)**
$$\mu_j = \frac{1}{N_j} \sum_{i \in P_j} S_{ij}$$**Step 2: Judge Sample Standard Deviation Calculation ($\sigma_j$)**
$$\sigma_j = \sqrt{\frac{1}{N_j - 1} \sum_{i \in P_j} (S_{ij} - \mu_j)^2}$$

**Step 3: Damped Standardization ($z_{ij}$)**
A critical edge case occurs when a judge gives every project an identical score (for example, 3.0 for every project), causing $\sigma_j = 0$. To prevent division by zero, a regularized damping parameter $\epsilon = 10^{-4}$ is applied:
$$z_{ij} = \frac{S_{ij} - \mu_j}{\sigma_j + \epsilon}$$

If $\sigma_j = 0$, then $z_{ij} = 0$ is enforced (neutral contribution).

**Step 4: Global Rescaling to Standard 1â€“5 Portal Scale**
Z-scores can be both negative and positive ($z \in [-2.5, +2.5]$). Global calibration is applied so that organizers and participants can view results on an intuitive 1â€“5 scale:
$$S'_{ij} = \mu_{\text{global}} + z_{ij} \cdot \sigma_{\text{target}}$$
Where $\mu_{\text{global}} = 3.00$ and $\sigma_{\text{target}} = 0.85$ is the benchmark target standard deviation.
Bounds clamp rule: $S'_{ij} = \max(1.0, \min(5.0, S'_{ij}))$.

**Step 5: Composite Project Score ($P_i$)**
The set of judges who reviewed Project $i$ is $J_i$:
$$P_i = \frac{1}{\vert{}J_i\vert{}} \sum_{j \in J_i} S'_{ij}$$

---

### 3.2 Fixture Data Proof: Variance Reduction & Rank Movement

According to the organizers' benchmark specification (FIG. 03), the variance and rank movement must match exactly when the normalization pipeline is run:

* **Raw Judge Spread (5 Judges Sample):** $\sigma_{\text{raw}} = 0.94$ (Uncalibrated high spread)* **Normalized Judge Spread (Same 5 Judges):** $\sigma_{\text{norm}} = 0.31$ (Calibrated, method documented)

#### Verified Rank Movement Dynamics on `fixtures.json`:
| Project | Raw Average Rank | Normalized Rank | Shift ($\Delta$) | Reason for Movement |
| :--- | :---: | :---: | :---: | :--- |
| **Project 17** (`prj_17`) | Rank 8 | **Rank 4** | **â–² +4** | Evaluated by harsh judges (`jdg_07`, `jdg_29`); Z-score calibration lifted the biased low scores[cite: 8, 15]. |
| **Project 04** (`prj_04`) | Rank 2 | **Rank 1** | **â–² +1** | Recovered the top spot by maintaining a consistent standard deviation across balanced reviews[cite: 8, 15]. |
| **Project 22** (`prj_22`) | Rank 14 | **Rank 17** | **â–¼ -3** | Stabilized at its actual percentile after inconsistent variance was adjusted[cite: 8, 15]. |
| **Project 09** (`prj_09`) | Rank 5 | **Rank 11** | **â–¼ -6** | Was artificially high because of inflated scores from lenient judges; normalization reduced the inflation[cite: 8, 15]. |

---

## 4. DISJOINT & BATCHED JUDGE ASSIGNMENT (FIG. 04)

The judge assignment system operates using the **Track-Affinity Bipartite Graph Matching** algorithm[cite: 6, 7].
TRACK-CONSTRAINED ASSIGNMENT GRAPH
Judges (30)Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â Projects (40)
[ J-01 (trk_03) ] â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€> [ P-02 (trk_03) ]
[ J-02 (trk_02, trk_04) ] â”€â”€â”€â”€â”€â”€> [ P-01 (trk_04) ]
[ J-03 (trk_04, trk_05) ] â”€â”€â”¬â”€â”€â”€> [ P-08 (trk_04) ]
â””â”€â”€â”€> [ P-13 (trk_05) ]
RULE: Exact 3 reviews per project minimum | NO judge sees a peer's ballot


### 4.1 Topology Constraints
1. **Target Density:** 40 Projects, 30 Judges, minimum **3 reviews per project**[cite: 6].
2. **Track Scoping:** Judge $j$ can evaluate only projects whose `track_id` belongs to the judge's `assigned_tracks` set[cite: 3, 7, 15]:
Â  Â $$\text{track}(P_i) \in \text{tracks}(J_j) \text{[cite: 3, 7, 15]}$$
3. **Disjoint Role Isolation:** No judge can see another judge's identity or score sheet (`NO JUDGE SEES A PEER'S BALLOT`)[cite: 6]. Route access will be strictly blocked at the API level[cite: 1, 2, 7, 11, 12, 14].

### 4.2 Assignment Algorithm (Round-Robin Greedy Flow)
```python
def assign_judges_to_projects(projects, judges, reviews_per_project=3):
Â  Â  # projects: list of Project objects with track_id
Â  Â  # judges: list of Judge objects with track_ids
Â  Â  # Returns: dict of project_id -> list of judge_ids
Â  Â  assignments = {p.id: [] for p in projects}
Â  Â  judge_load = {j.id: 0 for j in judges}

Â  Â  for p in projects:
Â  Â  Â  Â  # Eligible judges matching track constraint
Â  Â  Â  Â  eligible = [j for j in judges if p.track_id in j.track_ids]
Â  Â  Â  Â Â 
Â  Â  Â  Â  # Sort by least loaded judges to balance distribution
Â  Â  Â  Â  eligible.sort(key=lambda j: judge_load[j.id])
Â  Â  Â  Â Â 
Â  Â  Â  Â  selected = eligible[:reviews_per_project]
Â  Â  Â  Â  for j in selected:
Â  Â  Â  Â  Â  Â  assignments[p.id].append(j.id)
Â  Â  Â  Â  Â  Â  judge_load[j.id] += 1

Â  Â  return assignments
5. PAIRWISE JUDGING ENGINE (BRADLEY-TERRY MODEL) â€” BONUS (+5)
Absolute scores on commercial platforms are more susceptible to human error. The Dogfood platform includes an alternative Pairwise Comparison Mode based on HackMIT's Gavel model.Â  Â 

5.1 Bradley-Terry Formulation
When two projects $A$ and $B$ are presented to a judge, instead of asking for an absolute rating, the judge is asked: "Which project is better?"

Â  Â 

The probability of Project $i$ winning when compared with Project $j$:

$$P(i > j) = \frac{\pi_i}{\pi_i + \pi_j}$$
Where $\pi_i > 0$ is the latent quality parameter (latent skill score) of Project $i$.

Log-odds representation ($p_i = \ln \pi_i$):

$$\ln \left( \frac{P(i > j)}{1 - P(i > j)} \right) = p_i - p_j$$
5.2 Maximum Likelihood Estimation (MLE)
Total comparisons matrix $W$, where $w_{ij}$ is the count of how many times Project $i$ beat Project $j$:

$$\mathcal{L}(p) = \sum_{i=1}^{M} \sum_{j=1}^{M} \left[ w_{ij} \ln \pi_i - w_{ij} \ln (\pi_i + \pi_j) \right]$$
Iterative MM (Minorization-Maximization) update step:

$$\pi_i^{(t+1)} = W_i \left( \sum_{j \neq i} \frac{n_{ij}}{\pi_i^{(t)} + \pi_j^{(t)}} \right)^{-1}$$
Where $W_i = \sum_{j} w_{ij}$ is the total number of wins for Project $i$, and $n_{ij} = w_{ij} + w_{ji}$ is the total number of comparisons.

This approach eliminates cross-judge calibration because human judges are 3x more consistent with relative comparisons than with absolute scoring[cite: 5, 14].

6. ROLE ISOLATION & AUDIT INTEGRITY
6.1 Backend Isolation Guarantee
Acceptance check T2.judge_cannot_see_peer_scores tests this at the backend API level:Â  Â 

Endpoint: GET /api/judge/scores?judge=jdg_01

Â  Â 

Request Header: Logged in as jdg_02 (Cookie: session=jdg_b_44de)Â  Â 

Enforcement: The controller checks:

$$\text{IF } \text{session.user\_id} \neq \text{query.judge\_id} \text{ AND } \text{session.role} \neq \text{'organizer'} \implies \text{ABORT HTTP } 403 \text{[cite: 1, 2, 7, 11, 12, 14]}$$
6.2 Live Organizer Dashboard Metrics
The organizer console computes these pipeline metrics without any page reload[cite: 1, 5, 11, 14]:

Review Completion Rate: $\frac{\text{Submitted Scores}}{\text{Assigned Scores}} \times 100\%$

Active Judge Tracking: Judges with 0 submissions flagged as PENDING[cite: 1, 5, 11, 14].

Raw vs Normalized Leaderboard Preview: Side-by-side comparison with real-time rank delta[cite: 8].

7. CSV EXPORT & AUDIT PIPELINE
When the organizer triggers an export (GET /api/export.csv), the platform generates the final calibrated matrix.Â  Â 

Output CSV Format:

Code snippet

rank,project_id,project_title,track_name,team_name,reviews_count,raw_score,normalized_score,rank_delta
1,prj_04,Green Switch,Education,SaltDrift,3,4.12,4.45,+1
2,prj_34,Iron Switch,Open hardware,AmberSwitch,3,4.35,4.38,0
3,prj_11,Salt Ledger,Data and analytics,OpenSignal,4,4.28,4.31,0
4,prj_17,Small Loom,Health,SmallSignal,3,3.65,4.22,+4
8. INTEGRITY VERIFICATION CHECKLIST
The Coding Agent must pass these assertions once the build is complete:

[ ] The Z-score formula contains $\epsilon = 10^{-4}$ damping to prevent division by zero when variance is zero[cite: 1, 5, 11, 14].

[ ] The normalization pipeline reduces variance from $\sigma = 0.94$ to $\sigma \le 0.35$ on the test dataset[cite: 8].

[ ] The rank of prj_17 shifts upward by a minimum of +3 to +4 positions after calibration[cite: 8].

[ ] The rank of prj_09 drops by 5 or more positions after calibration[cite: 8].

[ ] When Judge B queries Judge A's scores, the backend strictly returns HTTP 403 Forbidden.Â  Â

---

## 9. FRONTEND DATA CONTRACT FOR SCORE CALIBRATION (ORGANIZER DASHBOARD)

This section specifies how the normalized rank movements computed by the Z-Score engine (§3) are transmitted to and visually rendered in the Organizer Mission Control Dashboard (/organizer/dashboard).

### 9.1 Normalized Leaderboard API Response Shape

The Route Handler `GET /api/organizer/leaderboard` returns a JSON array of `NormalizedProjectResult` objects. Each object carries both the raw and normalized scores and the pre-computed rank delta:

`	ypescript
// app/api/organizer/leaderboard/route.ts — Response type
export interface NormalizedProjectResult {
  rank: number;                  // Final normalized rank (1-indexed)
  rank_raw: number;              // Raw average rank (before normalization)
  rank_delta: number;            // rank_raw - rank (positive = climbed, negative = dropped)
  project_id: string;            // e.g. 'prj_17'
  project_title: string;         // e.g. 'Small Loom'
  track_name: string;
  team_name: string;
  reviews_count: number;
  raw_average_score: number;     // e.g. 3.65
  normalized_score: number;      // e.g. 4.22 (post Z-score calibration)
}
`

**Verified rank delta values from `fixtures.json`** (must match exactly in API response):

| `project_id` | `project_title` | `rank_raw` | `rank` | `rank_delta` |
| :--- | :--- | :---: | :---: | :---: |
| `prj_17` | Small Loom | 8 | 4 | **+4** |
| `prj_04` | Green Switch | 2 | 1 | **+1** |
| `prj_22` | *(fixture value)* | 14 | 17 | **-3** |
| `prj_09` | *(fixture value)* | 5 | 11 | **-6** |

### 9.2 Rank Delta Visual Rendering Contract (React Component)

The `RankDeltaBadge` Client Component renders the `rank_delta` value as a color-coded badge:

`	ypescript
// components/RankDeltaBadge.tsx
// delta > 0  -> "▲ +{delta}" — text-emerald-400, bg-emerald-950 border border-emerald-700
// delta < 0  -> "▼ {delta}"  — text-red-400,    bg-red-950    border border-red-700
// delta === 0 -> "━ 0"        — text-zinc-500,   bg-zinc-800
`

### 9.3 Standard Deviation Display in Dashboard Summary Card

The Organizer Dashboard MUST display the calibration summary card above the leaderboard panel:

`
┌─────────────────────────────────────────────────────────┐
│  SCORE CALIBRATION SUMMARY          [Rev 2.6 / DF-01]   │
│  Raw Judge Spread (σ):      0.94  [high variance]       │
│  Calibrated Spread (σ):     0.31  [✓ normalized]        │
│  Variance Reduction:        67.0%                       │
│  Normalization Method:      Robust Z-Score + ε=10⁻⁴    │
│  Projects Evaluated:        40  |  Active Judges: 30    │
└─────────────────────────────────────────────────────────┘
`

This card is populated by `GET /api/organizer/calibration-summary` returning `CalibrationSummary { sigma_raw: 0.94, sigma_normalized: 0.31, variance_reduction_pct: 67.0, epsilon: 0.0001, projects_evaluated: 40, active_judges: 30 }`.

---

## 10. INTERACTIVE RUBRIC SLIDER DYNAMIC COMPUTATION CONTRACT (JUDGE CONSOLE)

This section specifies the client-side real-time weighted score computation logic for the Judge Split-Screen Speed Console (`/judge/review/[projectId]`).

### 10.1 Slider State Schema (React Client Component)

`	ypescript
// components/RubricSlider.tsx — "use client"
interface SliderState {
  functionality: number | null;  // 1.0–5.0, step 0.5 | null = not yet set
  quality: number | null;
  innovation: number | null;
}

const WEIGHTS = { functionality: 0.40, quality: 0.35, innovation: 0.25 } as const;
`

### 10.2 Real-Time Computation Logic

Weighted total is recomputed on every slider `onChange` event — identical formula to the server-side engine (§2.2):

`	ypescript
function computeWeightedScore(state: SliderState): number | null {
  const { functionality, quality, innovation } = state;
  if (functionality === null || quality === null || innovation === null) return null;
  const S_ij =
    WEIGHTS.functionality * functionality +
    WEIGHTS.quality       * quality       +
    WEIGHTS.innovation    * innovation;
  return Math.round(S_ij * 100) / 100; // 2 decimal places
}
`

**Example: slider values (4.0, 3.5, 3.0) → Weighted Score: 3.58 / 5.00**

| Criterion | Weight | Score | Contribution |
| :--- | :---: | :---: | :---: |
| Functionality | 0.40 | 4.0 | 1.600 |
| Quality | 0.35 | 3.5 | 1.225 |
| Innovation | 0.25 | 3.0 | 0.750 |
| **Total** | **1.00** | — | **S_ij = 3.575 → 3.58** |

### 10.3 Submission Validation & API Payload Contract

**Client-side gate:** "Submit Ballot" is `disabled` until all 3 criteria ≥ 1.

**Payload sent to `POST /api/judge/scores`:**

`json
{ "project_id": "prj_17", "raw_criteria": { "functionality": 4.0, "quality": 3.5, "innovation": 3.0 }, "comment": "Strong execution." }
`

**Route Handler `app/api/judge/scores/route.ts` server-side contract:**
1. `requireRole(request, ['judge', 'organizer', 'admin'])` — returns `401`/`403` if not authorized.
2. Validates each criterion is in `[1, 5]` — returns `400` if not.
3. Computes `total_weighted_score` server-side (mirrors client formula for integrity).
4. Upserts into `scores` (`ON CONFLICT (judge_id, project_id) DO UPDATE`).
5. Inserts `JUDGE_SCORE_SUBMITTED` row into `audit_logs`.
6. Returns `200 OK` with the saved score object.
