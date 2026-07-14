import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login";
import DashboardLayout from "./pages/dashboard/layout";
import ProductsList from "./pages/dashboard/products/list-product";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "antd/dist/reset.css";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetail from "./pages/dashboard/products/detail-product";
import "@ant-design/v5-patch-for-react-19";
import CreateProductPage from "./pages/dashboard/products/create-product";
import CategoriesPage from "./pages/dashboard/categories/list-categories";
import SubCategoriesPage from "./pages/dashboard/categories/list-sub-categories";
import SubSubCategoriesPage from "./pages/dashboard/categories/list-sub-subcategories";
import NotFound from "./pages/not-found";
import ComingSoon from "./pages/dashboard/coming-soon";
import "./App.css";
import IngredientsList from "./pages/dashboard/ingreddients/list-ingreddients";
import BrandsList from "./pages/dashboard/brands/list-brands";
import ProductsByBrand from "./pages/dashboard/brands/list-product-by-brand";
import { jwtDecode } from "jwt-decode";
import SearchProductByEanPage from "./pages/dashboard/products/search-product";
import BannersList from "./pages/dashboard/banners/list-banners";
import DetailBanner from "./pages/dashboard/banners/detail-banner";
import CreateBannerPage from "./pages/dashboard/banners/create-banner";
import EditBannerPage from "./pages/dashboard/banners/edit-banner";
import StoriesList from "./pages/dashboard/stories/list-stories";
import GroupsList from "./pages/dashboard/groups/list-groups";
import GroupSubgroupsPage from "./pages/dashboard/groups/list-subgroups";
import ProductListsPage from "./pages/dashboard/groups/list-product-lists";
import ProductListProductsPage from "./pages/dashboard/groups/manage-product-list-products";
import SelectGroupProductsPage from "./pages/dashboard/groups/select-group-products";
import JourneysPage from "./pages/dashboard/groups/list-journeys";
import JourneyManagePage from "./pages/dashboard/groups/manage-journey";
const queryClient = new QueryClient();

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded: { exp?: number } = jwtDecode(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const RootRedirect = () => {
  const token = localStorage.getItem("token");
  const valid = isTokenValid(token);

  if (!valid && token) localStorage.removeItem("token");

  return <Navigate to={valid ? "/dashboard" : "/login"} replace />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard/*" element={<DashboardLayout />}>
              <Route
                index
                element={<Navigate to="products/search" replace />}
              />
              <Route path="coming-soon" element={<ComingSoon />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="products/create" element={<CreateProductPage />} />
              <Route
                path="products/search"
                element={<SearchProductByEanPage />}
              />
              <Route path="categories" element={<CategoriesPage />} />
              <Route
                path="categories/:categoryId"
                element={<SubCategoriesPage />}
              />
              <Route
                path="subcategories/:subCategoryId"
                element={<SubSubCategoriesPage />}
              />
              <Route path="ingredients" element={<IngredientsList />} />
              <Route path="brands" element={<BrandsList />} />
              <Route path="brands/:brandId" element={<ProductsByBrand />} />
              <Route path="banners" element={<BannersList />} />
              <Route path="banners/create" element={<CreateBannerPage />} />
              <Route path="banners/:id/edit" element={<EditBannerPage />} />
              <Route path="banners/:id" element={<DetailBanner />} />
              <Route path="stories" element={<StoriesList />} />
              <Route path="groups" element={<GroupsList />} />
              <Route
                path="groups/:groupId/subgroups"
                element={<GroupSubgroupsPage />}
              />
              <Route
                path="subgroups/:subgroupId/product-lists"
                element={<ProductListsPage />}
              />
              <Route
                path="product-lists/:productListId/products"
                element={<ProductListProductsPage />}
              />
              <Route
                path="product-lists/:productListId/products/select-group"
                element={<SelectGroupProductsPage />}
              />
              <Route
                path="subgroups/:subgroupId/journeys"
                element={<JourneysPage />}
              />
              <Route
                path="journeys/:journeyId"
                element={<JourneyManagePage />}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
