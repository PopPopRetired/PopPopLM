type DbWithClient = {
  $client: {
    execute: (statement: string) => Promise<unknown>;
  };
};

export const TEST_DB_URL = "file:./.tmp-users-test.sqlite";

export const configureTestDatabase = (url = TEST_DB_URL): void => {
  process.env.DATABASE_URL = url;
};


export const resetNotebooksTables = async (db: DbWithClient): Promise<void> => {
  await db.$client.execute("DROP TABLE IF EXISTS sources");
  await db.$client.execute("DROP TABLE IF EXISTS notebooks");
  await db.$client.execute("DROP TABLE IF EXISTS owners");
  await db.$client.execute(`
    CREATE TABLE owners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);
  await db.$client.execute(`
    CREATE TABLE notebooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      owner_id INTEGER NOT NULL REFERENCES owners(id)
    )
  `);
  await db.$client.execute(`
    CREATE TABLE sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notebook_id INTEGER NOT NULL REFERENCES notebooks(id),
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT,
      file_data BLOB,
      created_at INTEGER NOT NULL
    )
  `);
};
