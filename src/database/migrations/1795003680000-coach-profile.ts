import { MigrationInterface, QueryRunner } from "typeorm";

// Profil de l'observateur : sexe, fonction, poste d'attache et boîte postale (B21).
export class CoachProfile1795003680000 implements MigrationInterface {
    name = 'CoachProfile1795003680000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coach" ADD "sex" character varying`);
        await queryRunner.query(`ALTER TABLE "coach" ADD "function" character varying`);
        await queryRunner.query(`ALTER TABLE "coach" ADD "duty_station" character varying`);
        await queryRunner.query(`ALTER TABLE "coach" ADD "postal_box" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coach" DROP COLUMN "postal_box"`);
        await queryRunner.query(`ALTER TABLE "coach" DROP COLUMN "duty_station"`);
        await queryRunner.query(`ALTER TABLE "coach" DROP COLUMN "function"`);
        await queryRunner.query(`ALTER TABLE "coach" DROP COLUMN "sex"`);
    }

}
