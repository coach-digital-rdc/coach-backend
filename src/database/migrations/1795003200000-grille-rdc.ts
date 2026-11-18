import { MigrationInterface, QueryRunner } from "typeorm";

// Grille d'observation RDC (B04) : numéros et ordre de l'outil papier, domaine de
// rattachement, cote globale du sous-domaine et réponse « N/A ».
export class GrilleRdc1795003200000 implements MigrationInterface {
    name = 'GrilleRdc1795003200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competence" ADD "code" character varying`);
        await queryRunner.query(`ALTER TABLE "competence" ADD "domain_code" character varying`);
        await queryRunner.query(`ALTER TABLE "competence" ADD "domain_title" character varying`);
        await queryRunner.query(`ALTER TABLE "competence" ADD "display_order" integer`);
        await queryRunner.query(`ALTER TABLE "competence" ADD "has_global_score" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "question" ADD "code" character varying`);
        await queryRunner.query(`ALTER TABLE "question" ADD "display_order" integer`);
        await queryRunner.query(`ALTER TABLE "question" ADD "allow_na" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "allow_na"`);
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "display_order"`);
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "competence" DROP COLUMN "has_global_score"`);
        await queryRunner.query(`ALTER TABLE "competence" DROP COLUMN "display_order"`);
        await queryRunner.query(`ALTER TABLE "competence" DROP COLUMN "domain_title"`);
        await queryRunner.query(`ALTER TABLE "competence" DROP COLUMN "domain_code"`);
        await queryRunner.query(`ALTER TABLE "competence" DROP COLUMN "code"`);
    }

}
