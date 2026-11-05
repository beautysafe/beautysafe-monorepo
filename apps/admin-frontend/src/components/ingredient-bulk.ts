export const parseIngredientNames = (value: string): string[] => {
  const names: string[] = [];
  const seenNames = new Set<string>();
  for (const rawName of value.split(/[,\\]/)) {
    const name = rawName.trim();
    const normalizedName = name.toLocaleLowerCase();
    if (name && !seenNames.has(normalizedName)) {
      seenNames.add(normalizedName);
      names.push(name);
    }
  }
  return names;
};
