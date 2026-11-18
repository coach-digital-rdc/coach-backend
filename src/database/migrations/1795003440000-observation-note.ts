import { MigrationInterface, QueryRunner } from "typeorm";

// Notes chronologiques horodatées de l'observation (B13).
export class ObservationNote1795003440000 implements MigrationInterface {
    name = 'ObservationNote1795003440000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "observation_note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" uuid, "noted_at" TIMESTAMP, "content" text, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "PK_observation_note_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "observation_note" ADD CONSTRAINT "FK_observation_note_session" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "observation_note" DROP CONSTRAINT "FK_observation_note_session"`);
        await queryRunner.query(`DROP TABLE "observation_note"`);
    }

}
