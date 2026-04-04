/**
 * @module src/types/home.ts
 *
 * View-specific type definitions for the Homepage.
 *
 * Combines database-derived types with UI-specific presentation shapes
 * (e.g., pre-formatted date strings) used by the homepage grid and
 * carousel components.
 */
import { type SelectOwner } from "../db/schema";

/** Re-export SelectOwner from the schema for convenient use in home components. */
export { type SelectOwner };

/**
 * UI-ready representation of a notebook for the homepage grid.
 *
 * This shape is calculated by the home route handler by joining notebooks
 * with their sources and owners, then formatting dates and counts for display.
 */
export type FormattedNotebook = {
  /** Primary key of the notebook. */
  id: number;
  /** User-facing title. */
  title: string;
  /** Pre-formatted creation or last-updated date (e.g., "October 12, 2023"). */
  date: string;
  /** Human-friendly source count string (e.g., "5 sources"). */
  sources: string;
  /** Display name of the notebook's owner. */
  ownerName: string;
};
