# Project models and source verification

This revision gives each project its own geometry and composition. Models are authored in Three.js and rendered to static PNGs; no generated raster artwork is used. The models are explanatory software representations, not recorded queries, PR results or hardware.

| Visual | Actual project | Verified code or workflow |
|---|---|---|
| Repository intelligence scene | CodeForge AI | Vector and lexical PostgreSQL RPC retrieval, reciprocal-rank fusion, bounded source context and line references. scanner.py records the scanned commit and creates line-aware embedded chunks; main.py supplies context to answer generation and constructs commit-linked source URLs. [Inspected source](https://github.com/Lingu17/codeforage-ai/blob/62d8979626ad379ca2727135f3da68775ec2cde8/backend/rag.py) |
| Evidence pipeline | Vericore | ChromaDB candidates scored by cosine similarity plus lexical coverage; relevance gate, deduplication and adaptive context. api/chat.py skips the LLM and returns NOT_FOUND when retrieval yields no evidence. SourceEvidence contains document, page, section and passage metadata. [Inspected source](https://github.com/Lingu17/Vericore---Evidence-First-Document-Intelligence/blob/c1c9ddbd33d92898ed37f4323d3dbeee53b2769e/backend/app/services/retriever.py) |
| Repository relationship graph | Intervexa | graph() emits repository/file containment, Python AST declarations and module-path import matches. analyzer.py selects PR pairs by shared files/identifiers and compares function signatures and response keys; findings include revisions and source references and explicitly remain static evidence. [Inspected source](https://github.com/Lingu17/intervexa/blob/cef5c303a4bd4465c1a9222b654baae8d6ba5fd0/backend/app/intelligence.py) |
| Three-model hero | All three projects | Separate scene models summarize the corresponding verified workflows. There are no inter-product edges or shared services. [Inspected source](https://github.com/Lingu17/Lingu17/blob/ba45c2bd79f4bafe48c8a4ea2f93845aa387a9b7/README.md) |

## Additional projects

- **nexvio:** Video-upload analysis enqueues a task; posture-analysis-service/api/routes.py implements the corresponding posture queue and task-status route. [Source](https://github.com/Lingu17/nexvio/blob/9a50bce4d02b7f9a9c310a383b37c59a9998be95/src/interview-analysis-service/api/routes.py).
- **ai-chat-app-saved-history:** Chat messages load from and save to localStorage. api/chat.js forwards messages to a model provider. The UI does not use the empty Convex messages module for history. [Source](https://github.com/Lingu17/ai-chat-app-saved-history/blob/8f3a99925efbe6a2b97f6089c52cd1c85b7295f5/src/App.jsx).
- **Smart-Resume-AI:** PDF/DOCX text extraction and Groq JSON output. Suggestions are model-generated; no validated hiring or ATS performance is claimed. [Source](https://github.com/Lingu17/Smart-Resume-AI/blob/fc24799181293745307db81cb2eb676942a4f574/resume_parser.py).

## Distinct visual systems

| Model | Form and composition | Actual implementation represented |
|---|---|---|
| CodeForge AI | Dark source-length repository relief; file strata, two retrieval ribbons, merged chunk evidence and an answer endpoint. Text sits on the left. | Real backend files become line-aware chunks. The same repository-scoped chunk collection supplies vector/lexical results; reciprocal-rank fusion provides bounded, attributed context. The two ribbons are result paths, not separate databases or source partitions. A dashed citation path represents commit/file/line references. |
| Vericore | Light cutaway book with genuinely curved page geometry, highlighted passage extraction, a layered passage index, and a branching gate. Text sits on the right. | PDF/TXT extraction preserves document/page/section metadata. ChromaDB returns candidates scored by cosine plus lexical coverage. Evidence passing the gate reaches generation; absent evidence returns NOT_FOUND without calling the LLM. The document has schematic strokes, not fabricated passage content. |
| Intervexa | Dark spatial directed-import graph; hexagonal module nodes and a circular declaration node, followed by two selected revision ribbons and an advisory endpoint. | intelligence.py directly imports github.py, config.py, db.py, models.py, providers.py and security.py. It declares graph(). Conceptual PR A/B paths illustrate supported comparison categories: signatures and response keys. Edges do not claim resolved calls, actual PRs or proven defects. |

## Data-derived file model

Inspected CodeForge source counts: `main.py` 962 lines; `scanner.py` 1119; `embedding.py` 78; `rag.py` 39. The rendered heights use `0.5 + 2.35 * sqrt(lines / 1119)`. Heights express source length only, not importance, quality, latency, risk or any benchmark. These real files are illustrative repository inputs, not a claim of a recorded self-analysis run.

## Reproduce and edit

`tools/portfolio-3d/models.js` defines all three different models, source-count data, relationships, materials, camera positions and lighting. `index.html` defines their separate editorial layouts and the hero. `render.py` builds the static assets using a local browser. The dependency lockfile pins Three.js. Only PNG assets are used by the GitHub README; no script runs there.

## Completed checks

- Actual source counts match the model's constants.
- AST inspection confirms all six depicted imports and the graph declaration.
- All four PNGs decode, and the Markdown resolves all four relative asset paths.
- Models and text were visually inspected; a hero heading collision was repaired.
- The local Markdown preview loads all images and has no horizontal overflow at 390 and 768 pixels.
- GitHub repository/source links are preserved from the earlier HTTP checks. LinkedIn blocked automated checking; its original contact URL remains.
- No project application code was changed, no application test count was added, and no generated evidence or execution result is claimed.

## Inspected revisions

- `Lingu17`: `ba45c2bd79f4bafe48c8a4ea2f93845aa387a9b7`
- `codeforage-ai`: `62d8979626ad379ca2727135f3da68775ec2cde8`
- `Vericore---Evidence-First-Document-Intelligence`: `c1c9ddbd33d92898ed37f4323d3dbeee53b2769e`
- `intervexa`: `cef5c303a4bd4465c1a9222b654baae8d6ba5fd0`
- `nexvio`: `9a50bce4d02b7f9a9c310a383b37c59a9998be95`
- `ai-chat-app-saved-history`: `8f3a99925efbe6a2b97f6089c52cd1c85b7295f5`
- `Smart-Resume-AI`: `fc24799181293745307db81cb2eb676942a4f574`
