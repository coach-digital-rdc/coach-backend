// Loads the territorial hierarchy from a CSV file of this folder: one row per leaf
// (in the DRC: province, PROVED, sous-PROVED), with a header line.
// Usage: npm run seed:territoires-rdc (or: ts-node ./src/database/seeds/load-territoires.ts <file.csv>)
// Existing regions are kept, so the script can be run again.
import fs from "fs";
import path from "path";
import dataSource from "../config/ormconfig";
import { RegionService } from "../../modules/region/service";

const fileName = process.argv[2];

if (!fileName) {
  console.error(
    "Usage: ts-node ./src/database/seeds/load-territoires.ts <file.csv>"
  );
  process.exit(1);
}

const [, ...rows] = fs
  .readFileSync(path.join(__dirname, fileName), "utf8")
  .split(/\r?\n/)
  .filter((line) => line.trim())
  .map((line) => line.split(",").map((cell) => cell.trim()));

dataSource
  .initialize()
  .then(async () => {
    const { successCount, failItems } = await RegionService.createInBatch(rows);
    console.log(
      `Regions of ${fileName} loaded: ${successCount} rows, ${failItems.length} failed.`
    );
    failItems.forEach((row: string[]) => console.log("Failed:", row.join(" > ")));
    await dataSource.destroy();
  })
  .catch(async (err) => {
    console.error(`Error while loading regions ${fileName}:`, err);
    if (dataSource.isInitialized) await dataSource.destroy();
    process.exit(1);
  });
