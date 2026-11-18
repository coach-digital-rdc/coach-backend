import { MigrationInterface, QueryRunner } from "typeorm";

// Plan de développement professionnel (B18, B23) : versions des règles, bibliothèque
// d'objectifs, plan de la séance et ses objectifs.
export class Pdp1795003560000 implements MigrationInterface {
    name = 'Pdp1795003560000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pdp_rule_set" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer, "status" character varying, "diagnostic_config" jsonb, "max_objectives" integer, "published_at" TIMESTAMP, "published_by" uuid, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "PK_pdp_rule_set_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pdp_library_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rule_set_id" uuid, "question_id" uuid, "objective" text, "actions" text, "indicator" text, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "PK_pdp_library_item_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pdp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" uuid, "rule_set_id" uuid, "rule_set_version" integer, "diagnostic" text, "status" character varying, "validated_at" TIMESTAMP, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "PK_pdp_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pdp_objective" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pdp_id" uuid, "question_id" uuid, "category" character varying, "rank" integer, "objective" text, "actions" text, "indicator" text, "due_date" date, "origin" character varying, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "PK_pdp_objective_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pdp_library_item" ADD CONSTRAINT "FK_pdp_library_item_rule_set" FOREIGN KEY ("rule_set_id") REFERENCES "pdp_rule_set"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pdp_library_item" ADD CONSTRAINT "FK_pdp_library_item_question" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pdp" ADD CONSTRAINT "FK_pdp_session" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pdp" ADD CONSTRAINT "FK_pdp_rule_set" FOREIGN KEY ("rule_set_id") REFERENCES "pdp_rule_set"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pdp_objective" ADD CONSTRAINT "FK_pdp_objective_pdp" FOREIGN KEY ("pdp_id") REFERENCES "pdp"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pdp_objective" ADD CONSTRAINT "FK_pdp_objective_question" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pdp_objective" DROP CONSTRAINT "FK_pdp_objective_question"`);
        await queryRunner.query(`ALTER TABLE "pdp_objective" DROP CONSTRAINT "FK_pdp_objective_pdp"`);
        await queryRunner.query(`ALTER TABLE "pdp" DROP CONSTRAINT "FK_pdp_rule_set"`);
        await queryRunner.query(`ALTER TABLE "pdp" DROP CONSTRAINT "FK_pdp_session"`);
        await queryRunner.query(`ALTER TABLE "pdp_library_item" DROP CONSTRAINT "FK_pdp_library_item_question"`);
        await queryRunner.query(`ALTER TABLE "pdp_library_item" DROP CONSTRAINT "FK_pdp_library_item_rule_set"`);
        await queryRunner.query(`DROP TABLE "pdp_objective"`);
        await queryRunner.query(`DROP TABLE "pdp"`);
        await queryRunner.query(`DROP TABLE "pdp_library_item"`);
        await queryRunner.query(`DROP TABLE "pdp_rule_set"`);
    }

}
