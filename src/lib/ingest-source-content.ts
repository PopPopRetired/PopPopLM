/**
 * @module src/lib/ingest-source-content.ts
 *
 * Handles raw content extraction from three source types:
 * - **PDF** — parses uploaded PDF files via `pdf-parse`
 * - **URL** — fetches web pages (or YouTube transcripts) and extracts text via `cheerio`
 * - **Text** — accepts plain text directly (auto-promotes to URL if it looks like a link)
 *
 * Returns a normalized `{ extractedType, extractedTitle, extractedContent }` object
 * regardless of which branch ran, so the caller can store it uniformly.
 */
import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";
import { YoutubeTranscript } from "youtube-transcript";

/** Max characters for an auto-generated title when the user doesn't provide one. */
const TITLE_TRUNCATION_LENGTH = 37;

/**
 * Extracts displayable text content from a user-uploaded source.
 *
 * @param type          - The declared source type: `"pdf"`, `"url"`, or `"text"`.
 * @param rawContent    - The raw string content (URL string for urls, pasted text for text).
 * @param file          - The uploaded File object (only used for PDF type).
 * @param providedTitle - Optional user-supplied title. Falls back to auto-detection.
 * @returns Normalized extraction result with final type, title, and content.
 */
export async function extractContentFromUploadSource(
  type: string,
  rawContent: string,
  file?: File,
  providedTitle?: string,
): Promise<{ extractedType: string; extractedTitle: string; extractedContent: string }> {
  let extractedType = type;
  let extractedTitle =
    providedTitle && providedTitle.trim() !== "" ? providedTitle : "Untitled";
  let extractedContent = "";

  // ── PDF Branch ──────────────────────────────────────────────────────
  if (extractedType === "pdf" && file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const parser = new PDFParse({ data: Buffer.from(arrayBuffer) });
      const textResult = await parser.getText();
      extractedContent = textResult.text.trim();
    } catch (e) {
      console.error("Failed to parse PDF", e);
      extractedContent = "Could not extract text from PDF";
    }

    if (extractedTitle === "Untitled") {
      extractedTitle = file.name;
    }

    return { extractedType, extractedTitle, extractedContent };
  }

  // ── URL / Text Branch ───────────────────────────────────────────────
  if (extractedType === "url" || extractedType === "text") {
    extractedContent =
      typeof rawContent === "string" ? rawContent.trim() : "";

    // Auto-promote: if user selects "text" but pastes a URL, treat as URL
    if (
      extractedType === "text" &&
      (extractedContent.startsWith("http://") ||
        extractedContent.startsWith("https://"))
    ) {
      extractedType = "url";
    }

    // ── Fetch & parse URL content ───────────────────────────────────
    if (extractedType === "url") {
      try {
        let fetchUrl = rawContent;
        if (!fetchUrl.startsWith("http")) {
          fetchUrl = "https://" + fetchUrl;
        }

        const isYouTube =
          fetchUrl.includes("youtube.com/watch") ||
          fetchUrl.includes("youtu.be/");
        let youtubeText = "";

        // YouTube gets special handling: try grabbing the transcript first
        if (isYouTube) {
          try {
            const transcript =
              await YoutubeTranscript.fetchTranscript(fetchUrl);
            youtubeText = transcript.map((t) => t.text).join(" ");
          } catch (e) {
            console.error("Failed to fetch YouTube transcript", e);
          }
        }

        const res = await fetch(fetchUrl);
        if (res.ok) {
          const html = await res.text();
          const $ = cheerio.load(html);

          // Use the page <title> tag if the user didn't supply one
          if (extractedTitle === "Untitled" || extractedTitle.trim() === "") {
            const urlTitle = $("title").text().trim();
            if (urlTitle) {
              extractedTitle = urlTitle;
            }
          }

          if (isYouTube && youtubeText) {
            // Prefer the transcript over HTML-scraped text for YouTube
            extractedContent = youtubeText;
          } else {
            // Strip non-content elements, then extract body text
            $("script, style, noscript, nav, header, footer, iframe").remove();
            const extractedText = $("body")
              .text()
              .replace(/\s+/g, " ")
              .trim();
            extractedContent = extractedText || rawContent;
          }
        } else if (isYouTube && youtubeText) {
          // Page fetch failed but transcript succeeded — still usable
          extractedContent = youtubeText;
        }
      } catch (e) {
        console.error("Failed to fetch/parse URL", e);
      }
    }

    // ── Fallback title generation ───────────────────────────────────
    if (extractedTitle === "Untitled" || extractedTitle.trim() === "") {
      if (extractedType === "url") {
        extractedTitle = rawContent;
      } else {
        extractedTitle =
          rawContent.length > TITLE_TRUNCATION_LENGTH + 3
            ? rawContent.slice(0, TITLE_TRUNCATION_LENGTH) + "..."
            : rawContent || "Untitled Text";
      }
    }
  }

  return { extractedType, extractedTitle, extractedContent };
}
