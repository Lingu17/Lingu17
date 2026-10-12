# Portfolio artwork and source verification

Source inspected October 12, 2026. The current illustrations are constructed with original Three.js geometry, code-defined relationships and deterministic labels, then exported as static PNGs. They are conceptual models, not screenshots or recorded query results. No image-generation model was used for this version.

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

## What each object means

- **CodeForge:** the directory marker and source leaves use actual `backend/main.py` and `backend/rag.py` as illustrative inputs. Source leaves become line-aware chunk stacks. Blue and cyan retrieval routes represent vector and lexical results, which converge on bounded source evidence for generation. The dashed route represents commit/file/line citation metadata.
- **Vericore:** the PDF/TXT stack represents parsed documents; passage strips carry page-aware context. The circular layers represent a ChromaDB document index. Cosine similarity and lexical coverage are two scoring signals applied to candidates, not two invented databases. The evidence gate branches to generation with sources or NOT_FOUND without an LLM call.
- **Intervexa:** actual illustrative `backend/app/intelligence.py` and `github.py` file leaves are connected by a directed import edge. `intelligence.py` declares `graph()`. PR A/B are conceptual selected-revision labels, not real pull-request identifiers; source-change strips lead to advisory findings. Dynamic calls and execution outcomes are not asserted.
- White source strokes are schematic lines, not fabricated code, output or evidence. Shadows, file thickness and document layers supply depth; no server hardware, orchestration agents, random props or extra components are implied.

## Implementation

The reproducible model source is in `tools/portfolio-3d/`: geometry, materials, labels, camera, lighting, render wrapper and pinned dependency files. README rendering uses static images only. GitHub does not execute Three.js or JavaScript. Model source uses plain matte surfaces and restrained blue/cyan data paths without synthetic photographic textures.

## Validation

- All four PNGs decode successfully; the README resolves all four image paths.
- All rendered scenes were inspected for text, source semantics and cropping.
- The Markdown preview loads images and has no horizontal overflow at 390 and 768 pixels.
- Repository/source URLs are preserved from the prior check, where all 14 GitHub URLs returned HTTP 200. LinkedIn blocked automated checking; its original URL is retained.
- No project application code changed and no application test totals or performance claims are added.

## Inspected revisions

- `Lingu17`: `ba45c2bd79f4bafe48c8a4ea2f93845aa387a9b7`
- `codeforage-ai`: `62d8979626ad379ca2727135f3da68775ec2cde8`
- `Vericore---Evidence-First-Document-Intelligence`: `c1c9ddbd33d92898ed37f4323d3dbeee53b2769e`
- `intervexa`: `cef5c303a4bd4465c1a9222b654baae8d6ba5fd0`
- `nexvio`: `9a50bce4d02b7f9a9c310a383b37c59a9998be95`
- `ai-chat-app-saved-history`: `8f3a99925efbe6a2b97f6089c52cd1c85b7295f5`
- `Smart-Resume-AI`: `fc24799181293745307db81cb2eb676942a4f574`
