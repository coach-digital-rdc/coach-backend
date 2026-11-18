// Loads an observation grid (sub-domains and behaviours) from a JSON file of this folder.
// Usage: npm run seed:grille-rdc (or: ts-node ./src/database/seeds/load-grille.ts <file.json> [--replace])
// Rows are inserted or updated by id, so the script can be run again after a change of the file.
// With --replace, the sub-domains and behaviours missing from the file are marked as deleted.
import fs from "fs";
import path from "path";
import { In, IsNull, Not } from "typeorm";
import dataSource from "../config/ormconfig";
import { Competence } from "../../modules/competencies/entity/competence.entity";
import { Question } from "../../modules/question/entity/question.entity";

const [fileName, option] = process.argv.slice(2);

if (!fileName) {
  console.error(
    "Usage: ts-node ./src/database/seeds/load-grille.ts <file.json> [--replace]",
  );
  process.exit(1);
}

const grid: { competences: Competence[]; questions: Question[] } = JSON.parse(
  fs.readFileSync(path.join(__dirname, fileName), "utf8"),
);

dataSource
  .initialize()
  .then(async () => {
    await dataSource.transaction(async (manager) => {
      const now = new Date();
      await manager.save(
        Competence,
        grid.competences.map((c) => ({
          ...c,
          updated_at: now,
          deleted_at: null as any,
        })),
      );
      await manager.save(
        Question,
        grid.questions.map((q) => ({
          ...q,
          updated_at: now,
          deleted_at: null as any,
        })),
      );

      if (option === "--replace") {
        await manager.update(
          Question,
          {
            id: Not(In(grid.questions.map((q) => q.id))),
            deleted_at: IsNull(),
          },
          { deleted_at: now },
        );
        await manager.update(
          Competence,
          {
            id: Not(In(grid.competences.map((c) => c.id))),
            deleted_at: IsNull(),
          },
          { deleted_at: now },
        );
      }
    });
    console.log(
      `Grid ${fileName} loaded: ${grid.competences.length} sub-domains, ${grid.questions.length} behaviours.`,
    );
    await dataSource.destroy();
  })
  .catch(async (err) => {
    console.error(`Error while loading grid ${fileName}:`, err);
    if (dataSource.isInitialized) await dataSource.destroy();
    process.exit(1);
  });
