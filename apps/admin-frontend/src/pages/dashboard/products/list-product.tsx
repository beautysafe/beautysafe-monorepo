import React from 'react';
import { Table, message } from 'antd';
import { useProducts } from '../../../hooks/useProduct'; // Update path if different
import type { Product } from '../../../lib/entities/product.entity';

const ProductsList: React.FC = () => {
  const { data: products, isLoading, error } = useProducts();

  React.useEffect(() => {
    if (error) {
      message.error('Erreur lors de la récupération des produits');
      // Optional: Redirect on error
      // window.location.href = '/login';
    }
  }, [error]);

  // Columns can be defined outside render for readability
  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Nom', dataIndex: 'name' },
    { title: 'Marque', dataIndex: 'brand' },
    {
      title: 'EAN',
      dataIndex: 'eans',
      render: (eans: string[]) => eans?.join(', '),
    },
    // Add more columns as you want
  ];

  return (
    <Table<Product>
      loading={isLoading}
      dataSource={products || []}
      rowKey="id"
      columns={columns}
    />
  );
};

export default ProductsList;
