
export interface CategoryItem {
  name: string;
  depth: number;
}

export interface CategoryObject {
  main?: string;
  sub?: string;
  [key: string]: string | undefined;
}

export type Categories = CategoryItem[] | CategoryObject;

export interface CompositionDetail {
  function: string;
  quantity: string;
}

export type Compositions =
  | any[] 
  | { [ingredient: string]: CompositionDetail };

export interface ProductImages {
  image: string;
  thumbnail: string;
}

export interface Product {
  id: number;
  eans: string[];
  name: string;
  brand: string;
  score: number;
  validation_score: number;
  categories: Categories;
  compositions: Compositions;
  images: ProductImages;
}
