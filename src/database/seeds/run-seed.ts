// Runs a SQL seed file from this folder against the database configured in .env.
// Usage: npm run seed:fr (or: ts-node ./src/database/seeds/run-seed.ts <file.sql>)
import fs from "fs";
import path from "path";
import dataSource from "../config/ormconfig";

const fileName = process.argv[2];

if (!fileName) {
  console.error("Usage: ts-node ./src/database/seeds/run-seed.ts <file.sql>");
  process.exit(1);
}

const sql = fs.readFileSync(path.join(__dirname, fileName), "utf8");

dataSource
  .initialize()
  .then(async () => {
    // The seed files hold several statements and their own BEGIN/COMMIT.
    await dataSource.query(sql);
    console.log(`Seed ${fileName} loaded.`);
    await dataSource.destroy();
  })
  .catch(async (err) => {
    console.error(`Error while loading seed ${fileName}:`, err);
    if (dataSource.isInitialized) await dataSource.destroy();
    process.exit(1);
  });
