import { Hono } from "hono";
import { listNotebooksWithSourceCount, listOwners, createOwner, insertOwnerSchema } from "../db/queries/notebooks";
import { HomeView } from "../views/home";
import { OwnerCarousel } from "../components/OwnerCarousel";
import { NotebooksGrid } from "../components/NotebooksGrid";

const homeRoutes = new Hono();

const readBodyString = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

export const getFormattedNotebooks = async (ownerIdFilter?: number) => {
  const dbNotebooks = await listNotebooksWithSourceCount(ownerIdFilter);
  return dbNotebooks.map((nb: any) => {
    let dateStr = "No data";
    if (nb.sources.length > 0) {
      const firstSource = nb.sources[0];
      if (firstSource && firstSource.createdAt) {
          dateStr = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(firstSource.createdAt));
      }
    }
    return {
      id: nb.id,
      title: nb.title,
      date: dateStr,
      sources: `${nb.sourceCount} sources`,
      ownerName: nb.owner.name
    };
  });
};

homeRoutes.get("/", async (c) => {
  const notebooks = await getFormattedNotebooks();
  const dbOwners = await listOwners();
  
  return c.html(<HomeView notebooks={notebooks} dbOwners={dbOwners} />);
});

homeRoutes.get("/fragments/notebooks", async (c) => {
  const ownerId = c.req.query("ownerId");
  const filter = ownerId ? Number(ownerId) : undefined;
  const notebooks = await getFormattedNotebooks(filter);
  return c.html(<NotebooksGrid notebooks={notebooks} ownerIdFilter={filter} />);
});

homeRoutes.post("/fragments/owners", async (c) => {
  const body = await c.req.parseBody();
  const parsed = insertOwnerSchema.safeParse({ name: readBodyString(body.name) });
  
  if (!parsed.success) {
    return c.text("Invalid name", 400);
  }

  const [newOwner] = await createOwner(parsed.data);
  const dbOwners = await listOwners();
  const notebooks = await getFormattedNotebooks(newOwner.id);

  return c.html(
    <>
      <OwnerCarousel dbOwners={dbOwners} selectedOwnerId={newOwner.id} />
      <NotebooksGrid notebooks={notebooks} ownerIdFilter={newOwner.id} isOob={true} />
    </>
  );
});

export { homeRoutes };
