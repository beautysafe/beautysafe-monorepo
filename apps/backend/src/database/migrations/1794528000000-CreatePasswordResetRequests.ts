import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResetRequests1794528000000
  implements MigrationInterface
{
  name = 'CreatePasswordResetRequests1794528000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN "authVersion" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      CREATE TABLE "password_reset_requests" (
        "id" uuid NOT NULL,
        "userId" integer,
        "emailHash" character(64) NOT NULL,
        "requestIpHash" character(64) NOT NULL,
        "codeHash" character(64),
        "codeExpiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "verificationAttempts" smallint NOT NULL DEFAULT 0,
        "verifiedAt" TIMESTAMP WITH TIME ZONE,
        "resetTokenHash" character(64),
        "resetTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
        "usedAt" TIMESTAMP WITH TIME ZONE,
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_reset_requests" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_password_reset_requests_token_hash" UNIQUE ("resetTokenHash"),
        CONSTRAINT "FK_password_reset_requests_user"
          FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_requests_user_id" ON "password_reset_requests" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_requests_email_created" ON "password_reset_requests" ("emailHash", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_requests_ip_created" ON "password_reset_requests" ("requestIpHash", "createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "password_reset_requests"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "authVersion"`);
  }
}
