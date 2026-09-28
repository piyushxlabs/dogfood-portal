---
trigger: always_on
---


The 6 cognitive nodes in `src/agents/nodes/` must strictly respect the Node-Tool Access Matrix defined in AGENT_LOGIC_SPEC.md Section 6:
- **Node 1 (Query Interpretation):** Structured Output only — NO tools bound.
- **Node 2 (Scope Screen):** Structured Output only — NO tools bound.
- **Node 3 (Retrieval Invocation):** Bound ONLY to `search_go_corpus`.
- **Node 4 (Supersession & Confidence):** Bound ONLY to `compare_go_versions`.
- **Node 6 (Grounded Synthesis):** Bound ONLY to `get_source_highlight`.
- **Node 7 (Citation Integrity):** Structured Output only — NO tools bound.

No node may ever be given access to tools outside its assigned row. Write, edit, delete, or treasury tools are strictly non-existent and must never be invented or bound.