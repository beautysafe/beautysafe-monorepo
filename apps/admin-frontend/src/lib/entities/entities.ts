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
  totalProducts: number;
}

export interface Banner {
  id: number;
  title?: string | null;
  image: string;
  imageKey?: string | null;
  shortDescription?: string | null;
  longDescriptionHtml: string;
  published: boolean;
  products?: Product[];
}

export type CreateBannerPayload = {
  title?: string;
  image: string;
  imageKey?: string;
  shortDescription?: string;
  longDescriptionHtml: string;
  published?: boolean;
  productIds?: number[];
};

export type UpdateBannerPayload = {
  title?: string;
  image?: string;
  imageKey?: string;
  shortDescription?: string;
  longDescriptionHtml?: string;
  published?: boolean;
  productIds?: number[];
};

export interface Story {
  id: number;
  title: string;
  image: string;
  imageKey?: string | null;
  videos: string[];
  videoKeys?: string[];
}

export type ProductType = "Men" | "Women" | "Child" | "Baby";

export interface ProductImage {
  id: number;
  image: string;
  thumbnail: string;
  imageKey?: string | null;
  thumbnailKey?: string | null;
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
  imageUrls?: string[];
  thumbnailUrls?: string[];
  imageKeys?: string[];
  thumbnailKeys?: string[];
  brandId?: number;
  compositionIds?: number[];
  flagIds?: number[];
  averageRating?: number;
  ratingsCount?: number;
}
export type ProductsByFlagResponse = {
  data: Product[];
  hasMore: boolean;
  page: number;
  limit: number;
};

export interface Group {
  id: number;
  name: string;
  imageUrl?: string | null;
  imageKey?: string | null;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  subgroups?: SubGroupJourney[];
}

export interface SubGroupJourney {
  id: number;
  name: string;
  imageUrl?: string | null;
  imageKey?: string | null;
  createdAt: string;
  updatedAt: string;
  group?: Group;
  productLists?: ProductList[];
  journeys?: Journey[];
}

export interface ProductList {
  id: number;
  name: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  subgroup?: SubGroupJourney;
  products?: Product[];
}

export interface Journey {
  id: number;
  name: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  subgroup?: SubGroupJourney;
  phases?: JourneyPhase[];
  ingredients?: Ingredient[];
}

export interface JourneyPhase {
  id: number;
  name: string;
  htmlText: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export type PaginatedProductsResponse = {
  data: Product[];
  hasMore: boolean;
  page: number;
  limit: number;
  total: number;
  pageCount: number;
};

export type UnavailableProductStatus =
  | "PENDING"
  | "REVIEWING"
  | "ADDED"
  | "REJECTED";

export interface AdminUserSummary {
  id: number;
  email?: string;
  fullName?: string | null;
}

export interface UnavailableProduct {
  id: number;
  ean: string | null;
  userId: number | null;
  productName: string | null;
  brandName: string | null;
  notes: string | null;
  imageUrls: string[];
  status: UnavailableProductStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  resolvedProductId: number | null;
  user?: AdminUserSummary | null;
  resolvedProduct?: Pick<Product, "uid" | "name" | "ean"> | null;
}

export interface ProductFeedback {
  id: number;
  productId: number;
  userId: number;
  effectivenessRating: number;
  needsRating: number;
  repurchaseRating: number;
  averageRating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: AdminUserSummary;
  product?: Pick<Product, "uid" | "name" | "ean">;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
