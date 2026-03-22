---
name: Source Ingestion
description: Rules for extracting text from HTML, PDFs, and YouTube videos. Auto-attached when editing files related to source ingestion.
---

# Ingestion Rules

## Package Constraints

| Package              | Version | Notes                                                                              |
| -------------------- | ------- | ---------------------------------------------------------------------------------- |
| pdf-parse            | 2.4.5   | **v2 — drops default export `pdf(buffer)`, MUST use `new PDFParse()` class API**   |
| cheerio              | 1.2.0   | Use for HTML text extraction from URLs                                             |
| youtube-transcript   | 1.3.0   | Use for extracting transcript text from YouTube URLs                               |

## Check-Before-Write Rule

- **pdf-parse 2.4.5** — The v2 branch drops the legacy default export function (`pdf(buffer)`). You MUST use the class-based API: `import { PDFParse } from "pdf-parse"; const parser = new PDFParse({ data: buffer }); await parser.getText();`
- **youtube-transcript 1.3.0** — Use `YoutubeTranscript.fetchTranscript(url)` to retrieve an array of transcript blocks.
