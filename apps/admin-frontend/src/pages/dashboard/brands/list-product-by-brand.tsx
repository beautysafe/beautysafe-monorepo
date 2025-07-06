import React from "react";
import { Table, Spin } from "antd";
import { useProductsByBrand } from "../../../hooks/useProduct";
import { useNavigate, useParams} from "react-router-dom";

const ProductsByBrand: React.FC = () => {
const { brandId } = useParams();

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);

  const { data, isLoading } = useProductsByBrand(brandId ?? "", page, limit);
  const navigate = useNavigate();

  const columns = [
    { title: "ID", dataIndex: "uid" },
    { title: "Nom", dataIndex: "name" },
    { title: "EAN", dataIndex: "ean" },
    { title: "Score", dataIndex: "validScore" },
    {
      title: "Image",
      dataIndex: "images",
      render: (images: any[]) =>
        images && images.length > 0 && images[0].thumbnail ? (
          <img
            src={images[0].thumbnail}
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
        ),
    },
  ];

  return (
    <Spin spinning={isLoading}>
      <Table
        dataSource={data?.data || []}
        rowKey="uid"
        columns={columns}
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.total || 0,
          onChange: (newPage) => setPage(newPage),
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
