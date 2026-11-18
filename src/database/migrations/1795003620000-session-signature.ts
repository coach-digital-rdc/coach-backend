import { MigrationInterface, QueryRunner } from "typeorm";

// Signatures de la fiche d'observation (B17).
export class SessionSignature1795003620000 implements MigrationInterface {
    name = 'SessionSignature1795003620000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "session_signature" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" uuid, "signer_role" character varying, "signer_name" character varying, "image_id" uuid, "signed_at" TIMESTAMP, "refusal_reason" text, "absence_reason" text, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "PK_session_signature_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "session_signature" ADD CONSTRAINT "FK_session_signature_session" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_signature" DROP CONSTRAINT "FK_session_signature_session"`);
        await queryRunner.query(`DROP TABLE "session_signature"`);
    }

}
