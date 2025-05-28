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
import '@ant-design/v5-patch-for-react-19';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard/*" element={<DashboardLayout />}>
              <Route path="products" element={<ProductsList />} />
              <Route path="products/:id" element={<ProductDetail />} />

            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);