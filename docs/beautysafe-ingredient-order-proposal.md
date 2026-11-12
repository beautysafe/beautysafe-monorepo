# Product ingredient order proposal

## Current limitation

`product_ingredients` stores only `productUid` and `ingredientId`. A many-to-many
relation cannot preserve the submitted INCI order, so the first BeautySafe scoring
release must sort ingredients by `ingredientId`. Scores produced in that mode are
provisional and must not be described as verified INCI-order scores.

## Proposed follow-up schema

After approval, add a nullable integer `position` column to
`product_ingredients`:

```sql
ALTER TABLE product_ingredients ADD COLUMN position integer NULL;
```

Existing rows remain `NULL`; no historical order can be reconstructed safely.
For newly submitted compositions, store zero-based positions in the exact order
received from the admin/mobile client.

Recommended follow-up constraints and indexes:

- check `position >= 0` when it is not null;
- unique `(productUid, position)` for rows with a non-null position;
- retain the existing primary key `(productUid, ingredientId)`;
- retain the existing indexes beginning with `productUid` and `ingredientId`.

## TypeORM model change

Replace the implicit many-to-many join with an explicit `ProductIngredient`
entity containing `productUid`, `ingredientId`, `position`, and relations to
`Product` and `Ingredient`. Keep a compatibility mapping/serializer so existing
API responses can continue returning `composition: Ingredient[]`.

## API transition

Continue accepting the existing `compositionIds: number[]`; array order becomes
the source of `position` for new/updated products. A later additive response field
can expose ordered composition metadata without changing existing clients.

## Scoring transition

- if every row has a position, order by `position` and mark the calculation as
  INCI-ordered;
- if any position is missing, order deterministically by `ingredientId` and keep
  the result provisional;
- never infer concentration or historical order from ingredient IDs.

This proposal is documentation only. It intentionally makes no schema change in
the current implementation.
