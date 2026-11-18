import { MigrationInterface, QueryRunner } from "typeorm";

// Checklist documentaire (B12) : référentiel des 15 documents de l'annexe B et
// réponses de la séance dans la table existante documentation.
export class Checklist1795003380000 implements MigrationInterface {
    name = 'Checklist1795003380000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "checklist_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" integer, "owner" character varying, "document_name" character varying, "statement" text, "display_order" integer, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "PK_checklist_item_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "documentation" ADD "checklist_item_id" uuid`);
        await queryRunner.query(`ALTER TABLE "documentation" ADD "answer" boolean`);
        await queryRunner.query(`ALTER TABLE "documentation" ADD "proposal" text`);
        await queryRunner.query(`ALTER TABLE "documentation" ADD "filled_in_phase" character varying`);
        await queryRunner.query(`ALTER TABLE "documentation" ADD CONSTRAINT "FK_documentation_checklist_item" FOREIGN KEY ("checklist_item_id") REFERENCES "checklist_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documentation" DROP CONSTRAINT "FK_documentation_checklist_item"`);
        await queryRunner.query(`ALTER TABLE "documentation" DROP COLUMN "filled_in_phase"`);
        await queryRunner.query(`ALTER TABLE "documentation" DROP COLUMN "proposal"`);
        await queryRunner.query(`ALTER TABLE "documentation" DROP COLUMN "answer"`);
        await queryRunner.query(`ALTER TABLE "documentation" DROP COLUMN "checklist_item_id"`);
        await queryRunner.query(`DROP TABLE "checklist_item"`);
    }

}
