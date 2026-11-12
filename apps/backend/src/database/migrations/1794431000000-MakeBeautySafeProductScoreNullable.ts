import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeBeautySafeProductScoreNullable1794431000000
  implements MigrationInterface
{
  name = 'MakeBeautySafeProductScoreNullable1794431000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Do not rewrite existing zero scores: zero is a valid calculated result.
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "valide_bs_score" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "valide_bs_score" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "product" SET "valide_bs_score" = 0 WHERE "valide_bs_score" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "valide_bs_score" SET DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "valide_bs_score" SET NOT NULL`,
    );
  }
}
