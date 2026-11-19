import { MigrationInterface, QueryRunner } from "typeorm";

// Appréciation de l'observation, proposée puis retenue par l'observateur (B11).
export class Appreciation1795003800000 implements MigrationInterface {
    name = 'Appreciation1795003800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" ADD "suggested_appreciation" character varying`);
        await queryRunner.query(`ALTER TABLE "session" ADD "appreciation" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "appreciation"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "suggested_appreciation"`);
    }

}
