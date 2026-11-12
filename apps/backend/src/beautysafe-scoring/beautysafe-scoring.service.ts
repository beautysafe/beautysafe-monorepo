import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngredientStatus } from '../ingredients/entities/ingredient.entity';
import { Product } from '../products/entities/product.entity';
import {
  BeautySafeIngredientInput,
  BeautySafeScoreResult,
  calculateBeautySafeScore,
} from './beautysafe-scoring.algorithm';

export interface BeautySafeCompositionIngredient {
  id: number;
  name: string;
  bsScore: number;
  status: IngredientStatus;
}

export interface BeautySafeProductAssessment {
  productUid: number;
  score: number | null;
  result: BeautySafeScoreResult | null;
  reason: 'READY' | 'NO_COMPOSITION' | 'LOW_RECOGNITION';
}

interface CompositionRow {
  productUid: number | string;
  ingredientId: number | string;
  name: string | null;
  bsScore: number | string;
  status: IngredientStatus;
}

@Injectable()
export class BeautySafeScoringService {
  private readonly logger = new Logger(BeautySafeScoringService.name);
  private readonly pendingIngredientIds = new Set<number>();
  private processingIngredientChanges = false;

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {}

  isEnabled(): boolean {
    return (
      this.configService
        .get<string>('BS_SCORING_ENABLED', 'true')
        .toLowerCase() !== 'false'
    );
  }

  assessOrderedComposition(
    productUid: number,
    composition: BeautySafeCompositionIngredient[],
  ): BeautySafeProductAssessment {
    if (!composition.length) {
      return {
        productUid,
        score: null,
        result: null,
        reason: 'NO_COMPOSITION',
      };
    }

    const orderedInputs: BeautySafeIngredientInput[] = composition.map(
      (ingredient) => ({
        name: ingredient.name,
        score:
          ingredient.status === IngredientStatus.ACTIVE
            ? (ingredient.bsScore as BeautySafeIngredientInput['score'])
            : null,
        coef: 1,
        banned: false,
      }),
    );
    const result = calculateBeautySafeScore(orderedInputs);
    return {
      productUid,
      score: result.reliable ? result.score : null,
      result,
      reason: result.reliable ? 'READY' : 'LOW_RECOGNITION',
    };
  }

  async recalculateProduct(productUid: number): Promise<number | null> {
    if (!this.isEnabled()) {
      await this.updateAssessments([
        {
          productUid,
          score: null,
          result: null,
          reason: 'NO_COMPOSITION',
        },
      ]);
      return null;
    }
    const [assessment] = await this.assessProductUids([productUid]);
    await this.updateAssessments([assessment]);
    return assessment.score;
  }

  async assessProductUids(
    productUids: number[],
  ): Promise<BeautySafeProductAssessment[]> {
    const uniqueUids = Array.from(new Set(productUids));
    if (!uniqueUids.length) return [];

    const rows = await this.productsRepository.query<CompositionRow[]>(
      `SELECT
         pi."productUid" AS "productUid",
         i.id AS "ingredientId",
         i."officialName" AS "name",
         i.bs_score AS "bsScore",
         i.status::text AS "status"
       FROM product_ingredients pi
       INNER JOIN ingredient i ON i.id = pi."ingredientId"
       WHERE pi."productUid" = ANY($1::integer[])
       ORDER BY pi."productUid", i.id`,
      [uniqueUids],
    );

    const compositions = new Map<number, BeautySafeCompositionIngredient[]>(
      uniqueUids.map((uid) => [uid, []]),
    );
    rows.forEach((row) => {
      const productUid = Number(row.productUid);
      compositions.get(productUid)?.push({
        id: Number(row.ingredientId),
        name: row.name || String(row.ingredientId),
        bsScore: Number(row.bsScore),
        status: row.status,
      });
    });

    return uniqueUids.map((uid) =>
      this.assessOrderedComposition(uid, compositions.get(uid) ?? []),
    );
  }

  async recalculateProductUids(
    productUids: number[],
    batchSize = 250,
  ): Promise<BeautySafeProductAssessment[]> {
    if (!this.isEnabled()) return [];
    const uniqueUids = Array.from(new Set(productUids));
    const assessments: BeautySafeProductAssessment[] = [];

    for (let index = 0; index < uniqueUids.length; index += batchSize) {
      const batch = uniqueUids.slice(index, index + batchSize);
      const batchAssessments = await this.assessProductUids(batch);
      await this.updateAssessments(batchAssessments);
      assessments.push(...batchAssessments);
      await new Promise<void>((resolve) => setImmediate(resolve));
    }
    return assessments;
  }

  async findAffectedProductUids(ingredientId: number): Promise<number[]> {
    return this.findAffectedProductUidsForIngredients([ingredientId]);
  }

  private async findAffectedProductUidsForIngredients(
    ingredientIds: number[],
  ): Promise<number[]> {
    if (!ingredientIds.length) return [];
    const rows = await this.productsRepository.query<
      Array<{ productUid: number | string }>
    >(
      `SELECT DISTINCT "productUid"
       FROM product_ingredients
       WHERE "ingredientId" = ANY($1::integer[])
       ORDER BY "productUid"`,
      [ingredientIds],
    );
    return rows.map((row) => Number(row.productUid));
  }

  scheduleIngredientRecalculation(ingredientId: number): void {
    if (!this.isEnabled()) return;
    this.pendingIngredientIds.add(ingredientId);
    if (this.processingIngredientChanges) return;

    this.processingIngredientChanges = true;
    setImmediate(() => void this.processIngredientChanges());
  }

  private async processIngredientChanges(): Promise<void> {
    try {
      while (this.pendingIngredientIds.size) {
        const ingredientIds = Array.from(this.pendingIngredientIds);
        this.pendingIngredientIds.clear();
        const productUids =
          await this.findAffectedProductUidsForIngredients(ingredientIds);
        await this.recalculateProductUids(productUids);
        this.logger.log(
          `Recalculated ${productUids.length} product(s) after ingredient updates`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Background BeautySafe recalculation failed',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.processingIngredientChanges = false;
      if (this.pendingIngredientIds.size) {
        this.scheduleIngredientRecalculation(
          this.pendingIngredientIds.values().next().value as number,
        );
      }
    }
  }

  private async updateAssessments(
    assessments: BeautySafeProductAssessment[],
  ): Promise<void> {
    if (!assessments.length) return;
    await this.productsRepository.query(
      `UPDATE product p
       SET valide_bs_score = value.score
       FROM jsonb_to_recordset($1::jsonb) AS value(uid integer, score integer)
       WHERE p.uid = value.uid
         AND p.valide_bs_score IS DISTINCT FROM value.score`,
      [
        JSON.stringify(
          assessments.map((assessment) => ({
            uid: assessment.productUid,
            score: assessment.score,
          })),
        ),
      ],
    );
  }
}
