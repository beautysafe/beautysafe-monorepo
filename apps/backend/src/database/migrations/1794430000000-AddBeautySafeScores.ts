import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBeautySafeScores1794430000000 implements MigrationInterface {
  name = 'AddBeautySafeScores1794430000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ingredient" ADD "bs_score" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "ingredient" ADD CONSTRAINT "CHK_ingredient_bs_score" CHECK ("bs_score" IN (0, 2, 3, 5, 10))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "valide_bs_score" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "CHK_product_valide_bs_score" CHECK ("valide_bs_score" BETWEEN 0 AND 100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "CHK_product_valide_bs_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "valide_bs_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ingredient" DROP CONSTRAINT "CHK_ingredient_bs_score"`,
    );
    await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "bs_score"`);
  }
}
