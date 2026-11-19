import { MigrationInterface, QueryRunner } from "typeorm";

// Séances des cercles d'apprentissage menées dans les établissements (B22).
export class TlcEvaluation1795003740000 implements MigrationInterface {
    name = 'TlcEvaluation1795003740000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tlc_evaluation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "unit_id" character varying, "coach_id" uuid, "school_id" uuid, "evaluation" character varying, "participants" text, "participants_count" integer, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "PK_tlc_evaluation_id" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tlc_evaluation"`);
    }

}
