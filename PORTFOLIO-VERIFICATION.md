# Visual and claim verification

Source inspected on October 12, 2026. The SVGs are authored explanatory diagrams, not product screenshots, recorded analysis results, or an integrated application. Nodes name real entity types; geometry provides depth without adding system components.

| Visual | Actual project | Verified code or workflow |
|---|---|---|
| Repository intelligence scene | CodeForge AI | Vector and lexical PostgreSQL RPC retrieval, reciprocal-rank fusion, bounded source context and line references. scanner.py records the scanned commit and creates line-aware embedded chunks; main.py supplies context to answer generation and constructs commit-linked source URLs. [Inspected source](https://github.com/Lingu17/codeforage-ai/blob/62d8979626ad379ca2727135f3da68775ec2cde8/backend/rag.py) |
| Evidence pipeline | Vericore | ChromaDB candidates scored by cosine similarity plus lexical coverage; relevance gate, deduplication and adaptive context. api/chat.py skips the LLM and returns NOT_FOUND when retrieval yields no evidence. SourceEvidence contains document, page, section and passage metadata. [Inspected source](https://github.com/Lingu17/Vericore---Evidence-First-Document-Intelligence/blob/c1c9ddbd33d92898ed37f4323d3dbeee53b2769e/backend/app/services/retriever.py) |
| Repository relationship graph | Intervexa | graph() emits repository/file containment, Python AST declarations and module-path import matches. analyzer.py selects PR pairs by shared files/identifiers and compares function signatures and response keys; findings include revisions and source references and explicitly remain static evidence. [Inspected source](https://github.com/Lingu17/intervexa/blob/cef5c303a4bd4465c1a9222b654baae8d6ba5fd0/backend/app/intelligence.py) |
| Three-workbench hero | All three projects | Each row summarizes its corresponding verified workflow. Rows have no inter-product arrows or shared services. [Inspected source](https://github.com/Lingu17/Lingu17/blob/ba45c2bd79f4bafe48c8a4ea2f93845aa387a9b7/README.md) |

## Additional projects

- **nexvio:** Video-upload analysis enqueues a task; posture-analysis-service/api/routes.py implements the corresponding posture queue and task-status route. [Source](https://github.com/Lingu17/nexvio/blob/9a50bce4d02b7f9a9c310a383b37c59a9998be95/src/interview-analysis-service/api/routes.py).
- **ai-chat-app-saved-history:** Chat messages load from and save to localStorage. api/chat.js forwards messages to a model provider. The UI does not use the empty Convex messages module for history. [Source](https://github.com/Lingu17/ai-chat-app-saved-history/blob/8f3a99925efbe6a2b97f6089c52cd1c85b7295f5/src/App.jsx).
- **Smart-Resume-AI:** PDF/DOCX text extraction and Groq JSON output. Suggestions are model-generated; no validated hiring or ATS performance is claimed. [Source](https://github.com/Lingu17/Smart-Resume-AI/blob/fc24799181293745307db81cb2eb676942a4f574/resume_parser.py).

## New visual direction

This version replaces every flat SVG scene with original AI-generated 3D conceptual artwork, using the built-in imagegen tool. Physical material, depth, lighting and meaningful sculpted entities replace repeated cards. No JavaScript, interactive renderer or executable content is used in the README.

- The hero shows three independent product dioramas. Generalized file/directory labels deliberately avoid fabricated repository paths. The products have no inter-product integrations.
- CodeForge's standalone scene uses real `backend/main.py` and `backend/rag.py` filenames as illustrative source inputs. Solid strips represent indexed source chunks, dual rails represent vector and lexical retrieval, the evidence folio represents bounded retrieved context, and answer threads represent citations.
- Vericore's layered pages represent PDF/TXT text ingestion; passage strips represent page-aware chunks. The ChromaDB stack represents document indexing. Semantic similarity and lexical coverage feed an evidence gate. NOT_FOUND is a separate branch that skips the LLM call. The two rails are scoring concepts, not separate lexical and vector databases.
- Intervexa's standalone scene uses actual `backend/app/intelligence.py`, `backend/app/github.py` and `graph()` as illustrative source entities. `intelligence.py` imports from `github.py` and declares `graph()`. PR A/B labels are conceptual placeholders, not actual PR IDs. Marked change strips and source references communicate advisory comparison.
- Page numbers, line ranges, citation markers and change marks are illustrative metadata symbols, not a recorded query, diff or analysis result. Plinths, supports and rails provide spatial layout; they do not assert hardware or extra services.

The earlier inspected source revisions and source mapping remain the basis of the README. Project code has not been changed or retested. The original LinkedIn/GitHub contact URLs remain. No test count, benchmark, guaranteed answer correctness or configured hosted runner is claimed.

## Delivery

The profile README references the four rendered assets in assets/. Artwork was created with the built-in imagegen tool and checked against the inspected source workflows. Assets are static PNGs to preserve the requested rendered 3D look; the previous SVG assets are not required.

## Inspected revisions

- `Lingu17`: `ba45c2bd79f4bafe48c8a4ea2f93845aa387a9b7`
- `codeforage-ai`: `62d8979626ad379ca2727135f3da68775ec2cde8`
- `Vericore---Evidence-First-Document-Intelligence`: `c1c9ddbd33d92898ed37f4323d3dbeee53b2769e`
- `intervexa`: `cef5c303a4bd4465c1a9222b654baae8d6ba5fd0`
- `nexvio`: `9a50bce4d02b7f9a9c310a383b37c59a9998be95`
- `ai-chat-app-saved-history`: `8f3a99925efbe6a2b97f6089c52cd1c85b7295f5`
- `Smart-Resume-AI`: `fc24799181293745307db81cb2eb676942a4f574`

## Completed validation

- Four PNG assets decoded successfully and all README asset paths resolve.
- Generated artwork was visually inspected; hero invented filenames were replaced with entity labels and The Intervexa import connector was changed to a neutral line to avoid implying a bidirectional dependency.
- Markdown renders locally; images load at 390 and 768 px without horizontal overflow. Desktop and mobile previews were inspected. This is not a screenshot of GitHub rendering.
- Repository/source links are preserved from the earlier audit, where all 14 GitHub URLs returned HTTP 200. LinkedIn blocked automated verification (HTTP 999); its original URL remains.

