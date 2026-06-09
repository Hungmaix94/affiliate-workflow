---
description: LLM Wiki Knowledge Base Workflow
---

# LLM Wiki Workflow

A pattern for building and maintaining a personal knowledge base using the LLM Wiki concept (by Andrej Karpathy).

## The Wiki Architecture
- **Raw sources**: Your curated collection of immutable source documents (articles, papers, images).
- **The Wiki**: A directory of markdown files (summaries, entity pages, concepts, overview). Maintained entirely by the LLM.
- **The Schema**: Conventions on how the wiki is structured.

## Workflow Operations

### 1. Ingest
- When a new source is provided, read it and extract key takeaways.
- Write a summary page in the wiki.
- Update the index.
- Update relevant entity and concept pages across the wiki.
- Append an entry to the log file (e.g. `log.md`).

### 2. Query
- When the user asks a question, search for relevant pages using the index.
- Read them and synthesize an answer with citations.
- File good answers back into the wiki as new pages.

### 3. Lint
- Health-check the wiki.
- Find contradictions, stale claims, orphan pages, or missing cross-references.
- Suggest new questions or sources to look for.

Always maintain `index.md` (catalog of everything in the wiki) and `log.md` (chronological record of ingests and queries) to help navigate the wiki as it grows.