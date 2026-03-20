import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { z } from "zod";
import {
  countUsers,
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  type UserRecord,
} from "./db/queries/users";

const app = new Hono();

app.use("/public/*", serveStatic({ root: "./" }));
app.use("/node_modules/*", serveStatic({ root: "./" }));

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(255),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(255),
});

const idSchema = z.coerce.number().int().positive();

const readBodyString = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

const getDbErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("unique")) {
      return "Email already exists. Try a different one.";
    }
  }
  return "Database operation failed. Please try again.";
};

const renderUsersCountBadge = (count: number, isOob = false) => {
  const attrs = isOob ? { "hx-swap-oob": "outerHTML" } : {};
  return (
    <span
      id="users-count"
      class="badge badge-outline badge-lg"
      {...attrs}
    >{`Users: ${count}`}</span>
  );
};

const renderFlash = (
  message: string,
  tone: "success" | "error" | "info",
  isOob = false,
) => {
  const toneClass =
    tone === "success"
      ? "alert-success"
      : tone === "error"
        ? "alert-error"
        : "alert-info";
  const attrs = isOob ? { "hx-swap-oob": "outerHTML" } : {};
  return (
    <div id="crud-flash" class={`alert ${toneClass} text-sm`} {...attrs}>
      <span>{message}</span>
    </div>
  );
};

const renderUsersTable = (usersList: UserRecord[]) => {
  if (usersList.length === 0) {
    return (
      <div id="users-table" class="rounded-box border border-base-300 p-5">
        <p class="text-sm text-base-content/70">
          No users yet. Add one with the form above.
        </p>
      </div>
    );
  }

  return (
    <div id="users-table" class="grid grid-cols-1 gap-2.5">
      {usersList.map((user) => (
        <article class="rounded-box border border-base-300 bg-base-100 p-3 lg:p-3.5">
          <div class="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div class="space-y-1">
              <p class="text-xs text-base-content/60">{`User #${user.id}`}</p>
              <p class="font-medium leading-tight">{user.name}</p>
              <p class="text-sm text-base-content/80 break-all">{user.email}</p>
            </div>
            <button
              class="btn btn-error btn-outline btn-xs sm:btn-sm"
              hx-post={`/fragments/users/${user.id}/delete`}
              hx-target="#users-table"
              hx-swap="outerHTML"
            >
              <span class="iconify lucide--trash-2" />
              Delete
            </button>
          </div>

          <form
            class="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            hx-post={`/fragments/users/${user.id}/update`}
            hx-target="#users-table"
            hx-swap="outerHTML"
          >
            <input
              class="input input-bordered input-sm w-full"
              name="name"
              value={user.name}
              required
            />
            <input
              class="input input-bordered input-sm w-full"
              name="email"
              type="email"
              value={user.email}
              required
            />
            <button class="btn btn-outline btn-sm lg:self-stretch" type="submit">
              <span class="iconify lucide--pencil" />
              Update
            </button>
          </form>
        </article>
      ))}
    </div>
  );
};

const renderMutationResponse = (
  usersList: UserRecord[],
  userCount: number,
  message: string,
  tone: "success" | "error" | "info",
) => {
  return (
    <>
      {renderUsersTable(usersList)}
      {renderUsersCountBadge(userCount, true)}
      {renderFlash(message, tone, true)}
    </>
  );
};

app.get("/", async (c) => {
  const usersList = await listUsers();
  const userCount = usersList.length;

  return c.html(
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>PopPopLM CRUD + HTMX OOB Demo</title>
        <link rel="stylesheet" href="/public/styles.css" />
        <script src="/node_modules/htmx.org/dist/htmx.min.js" defer />
        <script src="/node_modules/alpinejs/dist/cdn.min.js" defer />
      </head>
      <body class="min-h-screen bg-base-200 text-base-content">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5 p-4 sm:p-6 lg:gap-4 lg:p-7 xl:p-6">
          <header class="navbar rounded-box bg-base-100 shadow-sm">
            <div class="navbar-start">
              <div class="text-xl font-semibold">PopPopLM</div>
            </div>
            <div class="navbar-end hidden items-center gap-2 md:flex">
              {renderUsersCountBadge(userCount)}
              <a href="#crud-demo" class="btn btn-primary btn-sm">
                CRUD Demo
              </a>
            </div>
          </header>

          <section class="hero rounded-box bg-base-100 p-5 shadow-sm sm:p-8 lg:p-7">
            <div class="hero-content w-full p-0">
              <div class="w-full">
                <h1 class="text-3xl font-bold sm:text-4xl">
                  Database CRUD + HTMX Out-of-Band Swap Demo
                </h1>
                <p class="mt-2.5 max-w-3xl text-sm text-base-content/80 sm:text-base">
                  This page demonstrates Drizzle-backed CRUD operations, HTMX v2
                  fragment rendering with out-of-band updates, and Iconify Lucide
                  icon usage in DaisyUI controls.
                </p>
                <div class="mt-4 flex flex-wrap gap-2">
                  <span class="badge badge-outline">Drizzle CRUD</span>
                  <span class="badge badge-outline">HTMX OOB</span>
                  <span class="badge badge-outline">Iconify Lucide</span>
                  <span class="badge badge-outline">Zod v4 validation</span>
                </div>
              </div>
            </div>
          </section>

          <section class="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-12" id="crud-demo">
            <article class="card bg-base-100 shadow-sm xl:col-span-8">
              <div class="card-body p-4 sm:p-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <h2 class="card-title">Users CRUD Demo</h2>
                  <button
                    class="btn btn-ghost btn-sm"
                    hx-get="/fragments/users"
                    hx-target="#users-table"
                    hx-swap="outerHTML"
                  >
                    <span class="iconify lucide--refresh-cw" />
                    Refresh table
                  </button>
                </div>

                {renderFlash("Ready for CRUD operations.", "info")}

                <form
                  class="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                  hx-post="/fragments/users"
                  hx-target="#users-table"
                  hx-swap="outerHTML"
                >
                  <label class="form-control">
                    <span class="label-text text-sm">Name</span>
                    <input
                      class="input input-bordered"
                      name="name"
                      placeholder="Ada Lovelace"
                      required
                    />
                  </label>
                  <label class="form-control">
                    <span class="label-text text-sm">Email</span>
                    <input
                      class="input input-bordered"
                      name="email"
                      type="email"
                      placeholder="ada@example.com"
                      required
                    />
                  </label>
                  <div class="sm:col-span-2">
                    <button class="btn btn-primary w-full sm:w-auto" type="submit">
                      <span class="iconify lucide--user-plus" />
                      Create user
                    </button>
                  </div>
                </form>

                <div class="mt-3">{renderUsersTable(usersList)}</div>
              </div>
            </article>

            <article class="card bg-base-100 shadow-sm xl:col-span-4" x-data="{ open: false }">
              <div class="card-body p-4 sm:p-5">
                <h2 class="card-title">How OOB works here</h2>
                <p class="text-sm text-base-content/80">
                  Each create/update/delete response swaps the users table in-band
                  and updates the navbar count and flash banner out-of-band.
                </p>
                <button
                  class="btn btn-outline btn-sm sm:btn-md"
                  {...{ "x-on:click": "open = !open", "x-bind:aria-expanded": "open" }}
                >
                  <span x-text="open ? 'Hide details' : 'Show details'" />
                </button>
                <template x-if="open">
                  <div class="alert alert-info mt-3">
                    <span>
                      OOB elements in responses use matching IDs and{" "}
                      <code>hx-swap-oob</code> to patch UI outside the primary
                      target.
                    </span>
                  </div>
                </template>
              </div>
            </article>
          </section>
        </div>

        <script>
          {`document.body.addEventListener("htmx:afterSwap", (event) => {
  const target = event.detail && event.detail.target;
  if (target && window.Alpine && typeof window.Alpine.initTree === "function") {
    window.Alpine.initTree(target);
  }
});`}
        </script>
      </body>
    </html>,
  );
});

app.get("/fragments/users", async (c) => {
  const usersList = await listUsers();
  return c.html(renderUsersTable(usersList));
});

app.post("/fragments/users", async (c) => {
  const body = await c.req.parseBody();
  const parsed = createUserSchema.safeParse({
    name: readBodyString(body.name),
    email: readBodyString(body.email),
  });

  const usersList = await listUsers();
  const userCount = await countUsers();

  if (!parsed.success) {
    return c.html(
      renderMutationResponse(
        usersList,
        userCount,
        parsed.error.issues[0]?.message ?? "Invalid form values.",
        "error",
      ),
    );
  }

  try {
    await createUser(parsed.data);
    const updatedUsersList = await listUsers();
    return c.html(
      renderMutationResponse(
        updatedUsersList,
        updatedUsersList.length,
        "User created successfully.",
        "success",
      ),
    );
  } catch (error) {
    return c.html(
      renderMutationResponse(usersList, userCount, getDbErrorMessage(error), "error"),
    );
  }
});

app.post("/fragments/users/:id/update", async (c) => {
  const idParsed = idSchema.safeParse(c.req.param("id"));
  const body = await c.req.parseBody();
  const inputParsed = updateUserSchema.safeParse({
    name: readBodyString(body.name),
    email: readBodyString(body.email),
  });

  const usersList = await listUsers();
  const userCount = usersList.length;

  if (!idParsed.success) {
    return c.html(
      renderMutationResponse(usersList, userCount, "Invalid user id.", "error"),
    );
  }

  if (!inputParsed.success) {
    return c.html(
      renderMutationResponse(
        usersList,
        userCount,
        inputParsed.error.issues[0]?.message ?? "Invalid form values.",
        "error",
      ),
    );
  }

  try {
    const updated = await updateUser(idParsed.data, inputParsed.data);
    const updatedUsersList = await listUsers();
    if (!updated) {
      return c.html(
        renderMutationResponse(
          updatedUsersList,
          updatedUsersList.length,
          "User not found.",
          "error",
        ),
      );
    }
    return c.html(
      renderMutationResponse(
        updatedUsersList,
        updatedUsersList.length,
        "User updated successfully.",
        "success",
      ),
    );
  } catch (error) {
    return c.html(
      renderMutationResponse(usersList, userCount, getDbErrorMessage(error), "error"),
    );
  }
});

app.post("/fragments/users/:id/delete", async (c) => {
  const idParsed = idSchema.safeParse(c.req.param("id"));
  const usersList = await listUsers();
  const userCount = usersList.length;

  if (!idParsed.success) {
    return c.html(
      renderMutationResponse(usersList, userCount, "Invalid user id.", "error"),
    );
  }

  try {
    const removed = await deleteUser(idParsed.data);
    const updatedUsersList = await listUsers();
    if (!removed) {
      return c.html(
        renderMutationResponse(
          updatedUsersList,
          updatedUsersList.length,
          "User not found.",
          "error",
        ),
      );
    }
    return c.html(
      renderMutationResponse(
        updatedUsersList,
        updatedUsersList.length,
        "User deleted successfully.",
        "success",
      ),
    );
  } catch (error) {
    return c.html(
      renderMutationResponse(usersList, userCount, getDbErrorMessage(error), "error"),
    );
  }
});

export default app;
