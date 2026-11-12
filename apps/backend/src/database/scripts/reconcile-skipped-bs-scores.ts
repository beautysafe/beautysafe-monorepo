import dataSource from '../data-source';
import { IngredientStatus } from '../../ingredients/entities/ingredient.entity';
import {
  BeautySafeIngredientInput,
  calculateBeautySafeScore,
} from '../../beautysafe-scoring/beautysafe-scoring.algorithm';

// Exact LOW_RECOGNITION and NO_COMPOSITION UIDs from migration_all_products.csv.
const SKIPPED_PRODUCT_UIDS = [
  31840, 40392, 45745, 46104, 47114, 47738, 268451, 273929, 437642, 437644,
  437645, 437647, 437649, 437650, 437651, 437653, 437654, 437655, 437656,
  437657, 437659, 437661, 437662, 437663, 437723, 437724, 437726, 437727,
  437728, 437730, 437731, 437732, 437733, 437734, 437735, 437739, 437741,
  437742, 437743, 437744, 437745, 437746, 437748, 437749, 437750, 437751,
  437752, 437753, 437754, 437755, 437756, 437757, 437759, 437760, 437761,
  437763, 437766, 437768, 437770, 437774, 437775, 437778, 437779, 437780,
  437781, 437782, 437783, 437784, 437786, 437788,
] as const;

if (
  SKIPPED_PRODUCT_UIDS.length !== 70 ||
  new Set(SKIPPED_PRODUCT_UIDS).size !== 70
) {
  throw new Error('The skipped BeautySafe UID set must contain 70 unique UIDs');
}

interface CorrectionRow {
  productUid: number | string;
  previousScore: number | string | null;
  ingredientId: number | string | null;
  name: string | null;
  bsScore: number | string | null;
  status: IngredientStatus | null;
}

interface CorrectionAssessment {
  uid: number;
  previousScore: number | null;
  nextScore: number | null;
  result: 'READY' | 'LOW_RECOGNITION' | 'NO_COMPOSITION';
  recognitionRate: number | null;
}

async function run(): Promise<void> {
  const apply = process.argv.includes('--apply');
  await dataSource.initialize();
  try {
    const column = await dataSource.query<
      Array<{ is_nullable: 'YES' | 'NO'; column_default: string | null }>
    >(
      `SELECT is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'product'
         AND column_name = 'valide_bs_score'`,
    );
    if (column.length !== 1 || column[0].is_nullable !== 'YES') {
      throw new Error(
        'Run MakeBeautySafeProductScoreNullable migration before this correction',
      );
    }

    const rows = await dataSource.query<CorrectionRow[]>(
      `SELECT
         p.uid AS "productUid",
         p.valide_bs_score AS "previousScore",
         i.id AS "ingredientId",
         i."officialName" AS "name",
         i.bs_score AS "bsScore",
         i.status::text AS "status"
       FROM product p
       LEFT JOIN product_ingredients pi ON pi."productUid" = p.uid
       LEFT JOIN ingredient i ON i.id = pi."ingredientId"
       WHERE p.uid = ANY($1::integer[])
       ORDER BY p.uid, i.id`,
      [SKIPPED_PRODUCT_UIDS],
    );

    const byProduct = new Map<number, CorrectionRow[]>();
    rows.forEach((row) => {
      const uid = Number(row.productUid);
      const group = byProduct.get(uid) ?? [];
      group.push(row);
      byProduct.set(uid, group);
    });

    const missing = SKIPPED_PRODUCT_UIDS.filter((uid) => !byProduct.has(uid));
    const assessments: CorrectionAssessment[] = [];
    for (const uid of SKIPPED_PRODUCT_UIDS) {
      const group = byProduct.get(uid);
      if (!group) continue;
      const previousScore =
        group[0].previousScore === null ? null : Number(group[0].previousScore);
      const composition = group.filter((row) => row.ingredientId !== null);
      if (!composition.length) {
        assessments.push({
          uid,
          previousScore,
          nextScore: null,
          result: 'NO_COMPOSITION',
          recognitionRate: null,
        });
        continue;
      }

      const inputs: BeautySafeIngredientInput[] = composition.map((row) => ({
        name: row.name || String(row.ingredientId),
        score:
          row.status === IngredientStatus.ACTIVE && row.bsScore !== null
            ? (Number(row.bsScore) as BeautySafeIngredientInput['score'])
            : null,
        coef: 1,
        banned: false,
      }));
      const score = calculateBeautySafeScore(inputs);
      assessments.push({
        uid,
        previousScore,
        nextScore: score.reliable ? score.score : null,
        result: score.reliable ? 'READY' : 'LOW_RECOGNITION',
        recognitionRate: score.recognitionRate,
      });
    }

    console.table(assessments);
    const counts = assessments.reduce<Record<string, number>>(
      (result, item) => {
        result[item.result] = (result[item.result] ?? 0) + 1;
        return result;
      },
      {},
    );
    console.log({ mode: apply ? 'APPLY' : 'DRY_RUN', counts, missing });

    if (!apply) {
      console.log(
        'No rows changed. Re-run with --apply after reviewing this output.',
      );
      return;
    }

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.query(
        `UPDATE product p
         SET valide_bs_score = value.score
         FROM jsonb_to_recordset($1::jsonb) AS value(uid integer, score integer)
         WHERE p.uid = value.uid
           AND p.valide_bs_score IS DISTINCT FROM value.score`,
        [
          JSON.stringify(
            assessments.map((assessment) => ({
              uid: assessment.uid,
              score: assessment.nextScore,
            })),
          ),
        ],
      );
      await queryRunner.commitTransaction();
      console.log('Correction committed for the exact skipped UID set');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  } finally {
    await dataSource.destroy();
  }
}

void run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
