import { MigrationInterface, QueryRunner } from "typeorm";

// Déroulement de la séance (B10, B11) : en-tête de la fiche, horodatage des étapes,
// activité observée, et sexe et charge hebdomadaire de l'enseignant.
export class DeroulementSeance1795003320000 implements MigrationInterface {
    name = 'DeroulementSeance1795003320000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" ADD "sex" character varying`);
        await queryRunner.query(`ALTER TABLE "teacher" ADD "weekly_load" integer`);
        await queryRunner.query(`ALTER TABLE "session" ADD "level" character varying`);
        await queryRunner.query(`ALTER TABLE "session" ADD "school_year" character varying`);
        await queryRunner.query(`ALTER TABLE "session" ADD "teacher_weekly_load" integer`);
        await queryRunner.query(`ALTER TABLE "session" ADD "last_observation_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "session" ADD "last_observation_rating" character varying`);
        await queryRunner.query(`ALTER TABLE "session" ADD "observer_function" character varying`);
        await queryRunner.query(`ALTER TABLE "session" ADD "start_time" character varying`);
        await queryRunner.query(`ALTER TABLE "session" ADD "end_time" character varying`);
        await queryRunner.query(`ALTER TABLE "session" ADD "advice" text`);
        await queryRunner.query(`ALTER TABLE "session" ADD "signed_place" character varying`);
        await queryRunner.query(`ALTER TABLE "session" ADD "observation_started_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "session" ADD "observation_ended_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "session" ADD "completed_at" TIMESTAMP`);
        await queryRunner.query(`CREATE TABLE "session_activity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" uuid, "sub_domain" character varying, "discipline" character varying, "sheet_code" character varying, "class_name" character varying, "p_i" character varying, "time" character varying, "essential_knowledge" text, "display_order" integer, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "PK_session_activity_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "session_activity" ADD CONSTRAINT "FK_session_activity_session" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_activity" DROP CONSTRAINT "FK_session_activity_session"`);
        await queryRunner.query(`DROP TABLE "session_activity"`);
        for (const column of ["completed_at", "observation_ended_at", "observation_started_at", "signed_place", "advice", "end_time", "start_time", "observer_function", "last_observation_rating", "last_observation_date", "teacher_weekly_load", "school_year", "level"]) {
            await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "${column}"`);
        }
        await queryRunner.query(`ALTER TABLE "teacher" DROP COLUMN "weekly_load"`);
        await queryRunner.query(`ALTER TABLE "teacher" DROP COLUMN "sex"`);
    }

}
