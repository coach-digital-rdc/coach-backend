import { MigrationInterface, QueryRunner } from "typeorm";

// Cote globale de 1 à 5 par sous-domaine et par séance (B15).
export class CompetenceScore1795003500000 implements MigrationInterface {
    name = 'CompetenceScore1795003500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "competence_score" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" uuid, "competence_id" uuid, "suggested_value" integer, "value" integer, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "PK_competence_score_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "competence_score" ADD CONSTRAINT "FK_competence_score_session" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competence_score" ADD CONSTRAINT "FK_competence_score_competence" FOREIGN KEY ("competence_id") REFERENCES "competence"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competence_score" DROP CONSTRAINT "FK_competence_score_competence"`);
        await queryRunner.query(`ALTER TABLE "competence_score" DROP CONSTRAINT "FK_competence_score_session"`);
        await queryRunner.query(`DROP TABLE "competence_score"`);
    }

}
