import { MigrationInterface, QueryRunner } from "typeorm";

// Réponse « N/A » d'un comportement (B05) : la valeur reste vide.
export class ReponseNa1795003260000 implements MigrationInterface {
    name = 'ReponseNa1795003260000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" ADD "not_applicable" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "not_applicable"`);
    }

}
