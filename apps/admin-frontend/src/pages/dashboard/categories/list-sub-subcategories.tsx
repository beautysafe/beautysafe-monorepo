import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Spin } from 'antd';
import { useSubCategoryById } from '../../../hooks/useSubCategory';

const { Title } = Typography;

const SubSubCategoriesPage: React.FC = () => {
  const { subCategoryId } = useParams<{ subCategoryId: string }>();
  const navigate = useNavigate();

  const { data: subCategory, isLoading } = useSubCategoryById(subCategoryId!);

  if (isLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  }

  const subSubCategories = subCategory?.subsubcategories || [];

  if (!subSubCategories.length) {
    navigate(`/dashboard/products?subcategory=${subCategoryId}`);
    return null;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <Title level={3} style={{ marginBottom: '2rem' }}>Sous-sous-catégories</Title>
      <Row gutter={[24, 24]}>
        {subSubCategories.map((subsub) => (
          <Col key={subsub.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => navigate(`/dashboard/products?subSubCategoryId=${subsub.id}`)}
              style={{ textAlign: 'center', borderRadius: 12 }}
            >
              <Title level={5}>{subsub.name}</Title>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SubSubCategoriesPage;
