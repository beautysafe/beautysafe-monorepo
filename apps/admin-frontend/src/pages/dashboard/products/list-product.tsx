import React from "react";
import { Table, message, Input, Button } from "antd";
import { useProducts, useProductByEan } from "../../../hooks/useProduct";
import type { Product } from "../../../lib/entities/product.entity";
import { useNavigate } from "react-router-dom";

const ProductsList: React.FC = () => {
  const { data: products, isLoading, error } = useProducts();
  const navigate = useNavigate();

  const [ean, setEan] = React.useState("");
  const [search, setSearch] = React.useState(""); // Triggers the API search

  // Only query by EAN if search was requested and ean is present
  const { data: foundProduct, isLoading: isSearching, error: searchError } = useProductByEan(search);

  React.useEffect(() => {
    if (error) {
      message.error('Erreur lors de la récupération des produits');
    }
    if (searchError) {
      message.error('Aucun produit trouvé avec cet EAN');
    }
  }, [error, searchError]);

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Nom', dataIndex: 'name' },
    { title: 'Marque', dataIndex: 'brand' },
    {
      title: 'EAN',
      dataIndex: 'eans',
      render: (eans: string[]) => eans?.join(', '),
    },
    {
      title: 'Image',
      dataIndex: 'images',
      render: (_: any, record: Product) =>
        record.images && record.images.thumbnail ? (
          <img
            src={record.images.thumbnail}
            alt={record.name}
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6, boxShadow: '0 1px 4px #eee' }}
          />
        ) : (
          <span style={{ color: "#bbb" }}>—</span>
        ),
    },
  ];

  // Build table data based on search state
  let tableData = products || [];
  if (search && foundProduct) {
    tableData = [foundProduct];
  } else if (search && !foundProduct && !isSearching) {
    tableData = []; // Show empty when search fails
  }

  return (
    <>
      <Input.Search
        placeholder="Rechercher par EAN (API)"
        allowClear
        style={{ width: 300, marginBottom: 16 }}
        value={ean}
        onChange={e => setEan(e.target.value)}
        enterButton="Chercher"
        loading={isSearching}
        onSearch={val => setSearch(val.trim())}
      />
      <Button
        style={{ marginLeft: 12 }}
        disabled={!search}
        onClick={() => {
          setEan("");
          setSearch(""); // Reset to full list
        }}
      >
        Réinitialiser
      </Button>
      <Table<Product>
        loading={isLoading || isSearching}
        dataSource={tableData}
        rowKey="id"
        columns={columns}
        onRow={record => ({
          onClick: () => navigate(`/dashboard/products/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </>
  );
};

export default ProductsList;
