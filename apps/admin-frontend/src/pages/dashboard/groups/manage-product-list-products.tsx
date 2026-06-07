import React, { useState } from "react";
import { Button, Input, message, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useParams } from "react-router-dom";
import type { Product } from "../../../lib/entities";
import {
  useAddProductListProducts,
  useProductListById,
  useRemoveProductListProduct,
} from "../../../hooks/useProductList";

const ProductListProductsPage: React.FC = () => {
  const { productListId = "" } = useParams();
  const [page, setPage] = useState(1);
  const [ean, setEan] = useState("");
  const { data: productList, isLoading } = useProductListById(productListId);
  const addProducts = useAddProductListProducts();
  const removeProduct = useRemoveProductListProduct();
  const pageSize = 20;

  const products = Array.from(
    new Map((productList?.products ?? []).map((product) => [product.uid, product])).values(),
  );
  const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  const addByEan = async () => {
    const cleanEan = ean.trim();
    if (!cleanEan) {
      message.error("EAN obligatoire");
      return;
    }
    try {
      await addProducts.mutateAsync({ id: productListId, data: { ean: cleanEan } });
      setEan("");
      message.success("Produit ajouté");
    } catch {
      message.error("Produit introuvable ou erreur d'ajout");
    }
  };

  const columns: ColumnsType<Product> = [
    { title: "UID", dataIndex: "uid", key: "uid" },
    { title: "Nom", dataIndex: "name", key: "name" },
    { title: "EAN", dataIndex: "ean", key: "ean" },
    {
      title: "Score",
      dataIndex: "validScore",
      key: "validScore",
      render: (score: number) => <Tag>{score}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Product) => (
        <Popconfirm
          title="Retirer ce produit ?"
          onConfirm={async () => {
            await removeProduct.mutateAsync({ id: productListId, productId: record.uid });
            message.success("Produit retiré");
          }}
        >
          <Button danger>Retirer</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <h2>{productList?.title ?? "Produits"}</h2>
      <Space.Compact style={{ width: "100%", marginBottom: 16 }}>
        <Input
          value={ean}
          placeholder="EAN du produit existant"
          onChange={(event) => setEan(event.target.value)}
          onPressEnter={addByEan}
        />
        <Button type="primary" loading={addProducts.isPending} onClick={addByEan}>
          Ajouter
        </Button>
      </Space.Compact>
      <Table
        columns={columns}
        dataSource={paginatedProducts}
        rowKey="uid"
        loading={isLoading}
        pagination={{
          current: page,
          total: products.length,
          pageSize,
          onChange: setPage,
        }}
      />
    </>
  );
};

export default ProductListProductsPage;
