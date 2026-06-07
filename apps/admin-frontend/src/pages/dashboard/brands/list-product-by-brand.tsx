import React from "react";
import { Table, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useProductsByBrand } from "../../../hooks/useProduct";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { Product } from "../../../lib/entities";

const cleanUrl = (value?: string | null): string | undefined => {
  const url = value?.trim();
  return url || undefined;
};

const getPageFromUrl = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const ProductsByBrand: React.FC = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = getPageFromUrl(searchParams.get("page"));
  const limit = 10;

  const { data, isLoading } = useProductsByBrand(brandId ?? "", page, limit);

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(newPage));

    setSearchParams(nextParams, { replace: true });
  };

  const columns: ColumnsType<Product> = [
    {
      title: "ID",
      dataIndex: "uid",
      key: "uid",
      width: 90,
    },
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {name}
        </span>
      ),
    },
    {
      title: "EAN",
      dataIndex: "ean",
      key: "ean",
      width: 160,
    },
    {
      title: "Score",
      dataIndex: "validScore",
      key: "validScore",
      width: 100,
    },
    {
      title: "Image",
      dataIndex: "images",
      key: "images",
      width: 90,
      render: (images: any[]) => {
        const imageUrl =
          cleanUrl(images?.[0]?.thumbnail) || cleanUrl(images?.[0]?.image);

        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Produit"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 6,
              boxShadow: "0 1px 4px #eee",
            }}
          />
        ) : (
          <span style={{ color: "#bbb" }}>—</span>
        );
      },
    },
  ];

  return (
    <Spin spinning={isLoading}>
      <Table<Product>
        dataSource={data?.data || []}
        rowKey="uid"
        columns={columns}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.total || 0,
          showQuickJumper: true,
          showSizeChanger: false,
          onChange: handlePageChange,
        }}
        onRow={(record) => ({
          onClick: () => navigate(`/dashboard/products/${record.uid}`),
          style: { cursor: "pointer" },
        })}
      />
    </Spin>
  );
};

export default ProductsByBrand;