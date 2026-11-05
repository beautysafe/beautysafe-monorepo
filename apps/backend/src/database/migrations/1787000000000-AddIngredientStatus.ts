import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIngredientStatus1787000000000 implements MigrationInterface {
  name = 'AddIngredientStatus1787000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."ingredient_status_enum" AS ENUM('ACTIVE', 'NEW')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ingredient" ADD "status" "public"."ingredient_status_enum" NOT NULL DEFAULT 'ACTIVE'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ingredient_status" ON "ingredient" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_ingredient_status"`);
    await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."ingredient_status_enum"`);
  }
}
