/**
 * @module src/routes/home.tsx
 *
 * Orchestrates the homepage flow for PopPopLM.
 *
 * This module handles:
 * 1. Initial page load (HomeView)
 * 2. HTMX-based notebook filtering (fetching by owner)
 * 3. HTMX-based owner registration
 */
import { Hono } from "hono";

import { NotebooksGrid } from "../components/NotebooksGrid";
import { OwnerCarousel } from "../components/OwnerCarousel";
import {
  createOwner,
  listNotebooksWithSourceCount,
  listOwners,
} from "../db/queries/notebooks";
import { insertOwnerSchema, type SelectOwner } from "../db/schema";
import type { AppEnv } from "../types";
import type { FormattedNotebook } from "../types/home";
import { HomeView } from "../views/home";

const homeRoutes = new Hono<AppEnv>();

/**
 * Normalizes a value from a request body into a string.
 *
 * @param value - Unknown value from request parsing.
 * @returns A safe string value.
 */
const readBodyString = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

/**
 * Fetches and formats notebook data for display in the HomeView grid.
 *
 * Joins notebook records with their source counts and owner names,
 * and formats the creation date of the first source.
 *
 * @param ownerIdFilter - Optional filter to limit results to one family member.
 * @returns Array of notebooks in a UI-ready presentation shape.
 */
export const getFormattedNotebooks = async (
  ownerIdFilter?: number,
): Promise<FormattedNotebook[]> => {
  // Use custom type to avoid 'any' mapping
  const dbNotebooks = await listNotebooksWithSourceCount(ownerIdFilter);

  return dbNotebooks.map((nb) => {
    let dateStr = "No data";
    const firstSource = nb.sources?.[0];

    if (firstSource?.createdAt) {
      dateStr = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(firstSource.createdAt));
    }

    return {
      id: nb.id,
      title: nb.title,
      date: dateStr,
      sources: `${nb.sourceCount} sources`,
      ownerName: nb.owner.name,
    };
  });
};

/**
 * GET /
 * Renders the full homepage with initial filtered notebooks.
 */
homeRoutes.get("/", async (c) => {
  const notebooks = await getFormattedNotebooks();
  const dbOwners = (await listOwners()) as SelectOwner[];

  return c.html(<HomeView notebooks={notebooks} dbOwners={dbOwners} />);
});

/**
 * GET /fragments/notebooks
 * HTMX Fragment: Re-renders only the notebook grid when an owner is selected.
 */
homeRoutes.get("/fragments/notebooks", async (c) => {
  const ownerId = c.req.query("ownerId");
  const filter = ownerId ? Number(ownerId) : undefined;
  const notebooks = await getFormattedNotebooks(filter);
  return c.html(<NotebooksGrid notebooks={notebooks} ownerIdFilter={filter} />);
});

/**
 * POST /fragments/owners
 * HTMX Action: Creates a new owner and re-renders both the carousel and grid.
 */
homeRoutes.post("/fragments/owners", async (c) => {
  const body = await c.req.parseBody();
  const parsed = insertOwnerSchema.safeParse({
    name: readBodyString(body.name),
  });

  if (!parsed.success) {
    return c.text("Invalid name", 400);
  }

  const [newOwner] = await createOwner(parsed.data);
  const dbOwners = (await listOwners()) as SelectOwner[];
  const notebooks = await getFormattedNotebooks(newOwner.id);

  // Returns multiple fragments - the carousel and an OOB-swapped grid
  return c.html(
    <>
      <OwnerCarousel dbOwners={dbOwners} selectedOwnerId={newOwner.id} />
      <NotebooksGrid
        notebooks={notebooks}
        ownerIdFilter={newOwner.id}
        isOob={true}
      />
    </>,
  );
});

export { homeRoutes };
