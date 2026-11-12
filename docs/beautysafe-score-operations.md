# BeautySafe score operations

## Runtime calculation

`BS_SCORING_ENABLED` controls automatic calculation. It is enabled unless the
value is explicitly `false`. Product creation and composition updates calculate
one product synchronously. Ingredient `bs_score` or review-status updates enqueue
affected products for non-blocking, ID-ordered batch recalculation inside the
running Nest process.

Current results remain **provisional** because `product_ingredients` does not
contain original INCI positions.

## Nullable score migration

Build and inspect pending migrations:

```bash
pnpm --filter backend build
pnpm --filter backend migration:show:prod
```

Run locally/staging:

```bash
pnpm --filter backend migration:run
```

Production startup already runs compiled pending migrations before Nest starts.
`MakeBeautySafeProductScoreNullable1794431000000` only drops the column default
and `NOT NULL`; it does not rewrite any existing score.

## Exact skipped-product correction

The reconciliation command contains only the 70 UIDs reported as
`LOW_RECOGNITION` or `NO_COMPOSITION` by `migration_all_products.csv`. It reloads
their current compositions and ingredient review states before deciding whether
to write a numeric score or `NULL`.

Dry run first:

```bash
pnpm --filter backend bs-score:reconcile-skipped
```

After reviewing all 70 rows, apply locally/staging:

```bash
pnpm --filter backend bs-score:reconcile-skipped --apply
```

For a compiled Render shell after deployment:

```bash
pnpm --filter backend bs-score:reconcile-skipped:prod --apply
```

The command never scans or updates the full catalogue. It sets `NULL` for rows
that still lack composition or remain below 70% recognition, and writes a score
(including a legitimate numeric zero) if a formerly skipped product is now
eligible.
