export interface Brand {
  id: number;
  name: string;
  totalProducts: number;
}

export interface Category {
  id: number;
  name: string;
  subcategories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  category: Category;
  subsubcategories?: SubSubCategory[];
}

export interface SubSubCategory {
  id: number;
  name: string;
  subcategory: SubCategory;
}

export interface Family {
  id: number;
  name: string;
  score: number;
}

export interface Ingredient {
  id: number;
  name: string;
  officialName: string;
  score: number;
  families: Family[];
}

export interface Flag {
  id: number;
  name: string;
}

export type ProductType = "Men" | "Women" | "Child" | "Baby";

export interface ProductImage {
  id: number;
  image: string;
  thumbnail: string;
}

export interface Product {
  uid: number;
  name: string;
  validScore: number;
  ean: string;
  type: ProductType;
  brand: Brand;
  category?: Category | null;
  subCategory?: SubCategory | null;
  subSubCategory?: SubSubCategory | null;
  images: ProductImage[];
  composition: Ingredient[];
  flags: Flag[];
}
