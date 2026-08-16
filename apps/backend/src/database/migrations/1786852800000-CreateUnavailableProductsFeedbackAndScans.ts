import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUnavailableProductsFeedbackAndScans1786852800000
  implements MigrationInterface
{
  name = 'CreateUnavailableProductsFeedbackAndScans1786852800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."unavailable_products_status_enum" AS ENUM('PENDING', 'REVIEWING', 'ADDED', 'REJECTED')`,
    );
    await queryRunner.query(`
      CREATE TABLE "unavailable_products" (
        "id" SERIAL NOT NULL,
        "ean" character varying(64),
        "userId" integer,
        "productName" character varying(255),
        "brandName" character varying(255),
        "notes" text,
        "imageUrls" text array NOT NULL,
        "imageKeys" text array NOT NULL DEFAULT '{}',
        "status" "public"."unavailable_products_status_enum" NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "resolvedAt" TIMESTAMP WITH TIME ZONE,
        "resolvedProductId" integer,
        CONSTRAINT "CHK_unavailable_products_images" CHECK (cardinality("imageUrls") >= 1),
        CONSTRAINT "PK_unavailable_products" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_unavailable_products_user_id" ON "unavailable_products" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_unavailable_products_created_at" ON "unavailable_products" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_unavailable_products_status" ON "unavailable_products" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_unavailable_products_ean" ON "unavailable_products" ("ean")`,
    );
    await queryRunner.query(`
      ALTER TABLE "unavailable_products"
      ADD CONSTRAINT "FK_unavailable_products_user"
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "unavailable_products"
      ADD CONSTRAINT "FK_unavailable_products_resolved_product"
      FOREIGN KEY ("resolvedProductId") REFERENCES "product"("uid") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "product_feedback" (
        "id" SERIAL NOT NULL,
        "productId" integer NOT NULL,
        "userId" integer NOT NULL,
        "effectivenessRating" smallint NOT NULL,
        "needsRating" smallint NOT NULL,
        "repurchaseRating" smallint NOT NULL,
        "comment" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_product_feedback_ratings" CHECK (
          "effectivenessRating" BETWEEN 1 AND 5
          AND "needsRating" BETWEEN 1 AND 5
          AND "repurchaseRating" BETWEEN 1 AND 5
        ),
        CONSTRAINT "UQ_product_feedback_user_product" UNIQUE ("userId", "productId"),
        CONSTRAINT "PK_product_feedback" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_feedback_product_id" ON "product_feedback" ("productId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_feedback_user_id" ON "product_feedback" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_feedback_created_at" ON "product_feedback" ("createdAt")`,
    );
    await queryRunner.query(`
      ALTER TABLE "product_feedback"
      ADD CONSTRAINT "FK_product_feedback_product"
      FOREIGN KEY ("productId") REFERENCES "product"("uid") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "product_feedback"
      ADD CONSTRAINT "FK_product_feedback_user"
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE "product_scans" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "productId" integer NOT NULL,
        "ean" character varying(64),
        "scannedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_scans" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_scans_user_id" ON "product_scans" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_scans_product_id" ON "product_scans" ("productId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_scans_scanned_at" ON "product_scans" ("scannedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_scans_user_scanned_at" ON "product_scans" ("userId", "scannedAt")`,
    );
    await queryRunner.query(`
      ALTER TABLE "product_scans"
      ADD CONSTRAINT "FK_product_scans_user"
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "product_scans"
      ADD CONSTRAINT "FK_product_scans_product"
      FOREIGN KEY ("productId") REFERENCES "product"("uid") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_scans" DROP CONSTRAINT "FK_product_scans_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_scans" DROP CONSTRAINT "FK_product_scans_user"`,
    );
    await queryRunner.query(`DROP TABLE "product_scans"`);

    await queryRunner.query(
      `ALTER TABLE "product_feedback" DROP CONSTRAINT "FK_product_feedback_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_feedback" DROP CONSTRAINT "FK_product_feedback_product"`,
    );
    await queryRunner.query(`DROP TABLE "product_feedback"`);

    await queryRunner.query(
      `ALTER TABLE "unavailable_products" DROP CONSTRAINT "FK_unavailable_products_resolved_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "unavailable_products" DROP CONSTRAINT "FK_unavailable_products_user"`,
    );
    await queryRunner.query(`DROP TABLE "unavailable_products"`);
    await queryRunner.query(
      `DROP TYPE "public"."unavailable_products_status_enum"`,
    );
  }
}
