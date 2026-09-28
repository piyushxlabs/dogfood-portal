---
trigger: always_on
---

The 5 foundational specification documents located in `docs/`:
1. `SYSTEM_SCOPE_AND_BEHAVIOR.md` (Scope, Hard Prohibitions, Air-gap boundaries)
2. `DATA-MODEL.md` (SQL Schema DDL, Tables, TypeScript Interfaces, Fixtures Mapping)
3. `JUDGING.md` (Z-Score Normalization Math, Proof, Assignment Graph, Bradley-Terry Model)
4. `ARCHITECTURE.md` (Next.js Port 8080 Standalone Topology, Role Isolation Matrix, Dashboard Hierarchy)
5. `AGENT_MASTER_PLAN.md` (Phase-Gated 6-Phase Execution Roadmap)

are your ABSOLUTE and CONSTITUTIONAL source of truth.

Never deviate from them. Do NOT import external LLM APIs, do NOT configure cloud databases or hosted auth, and do NOT invent routes outside `.dogfood.toml`.