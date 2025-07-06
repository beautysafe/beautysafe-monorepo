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

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard/*" element={<DashboardLayout />}>
              <Route path="coming-soon" element={<ComingSoon />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="products/create" element={<CreateProductPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route
                path="categories/:categoryId"
                element={<SubCategoriesPage />}
              />              
              <Route
                path="subcategories/:subCategoryId"
                element={<SubSubCategoriesPage />}
              />
              <Route
                path="ingredients"
                element={<IngredientsList />}
              />
              <Route
                path="brands"
                element={<BrandsList />}
              />
              <Route
                path="brands/:brandId"
                element={<ProductsByBrand />}
              />    
          
            </Route>
          </Route>
          <Route path="/login" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
