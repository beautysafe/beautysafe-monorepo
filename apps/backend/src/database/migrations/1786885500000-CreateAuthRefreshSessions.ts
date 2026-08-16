import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthRefreshSessions1786885500000
  implements MigrationInterface
{
  name = 'CreateAuthRefreshSessions1786885500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "auth_refresh_sessions" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "tokenHash" character(64) NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_auth_refresh_sessions_token_hash" UNIQUE ("tokenHash"),
        CONSTRAINT "PK_auth_refresh_sessions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_auth_refresh_sessions_user_id" ON "auth_refresh_sessions" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_auth_refresh_sessions_expires_at" ON "auth_refresh_sessions" ("expiresAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_auth_refresh_sessions_revoked_at" ON "auth_refresh_sessions" ("revokedAt")`,
    );
    await queryRunner.query(`
      ALTER TABLE "auth_refresh_sessions"
      ADD CONSTRAINT "FK_auth_refresh_sessions_user"
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_refresh_sessions" DROP CONSTRAINT "FK_auth_refresh_sessions_user"`,
    );
    await queryRunner.query(`DROP TABLE "auth_refresh_sessions"`);
  }
}
