import React from "react";
import { Card, Input, Button, Typography, Space, Alert, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useProductByEan } from "../../../hooks/useProduct";

const { Title, Text } = Typography;

const SearchProductByEanPage: React.FC = () => {
  const navigate = useNavigate();

  const [inputValue, setInputValue] = React.useState("");
  const [searchedEan, setSearchedEan] = React.useState("");
  const [hasSearched, setHasSearched] = React.useState(false);

  const {
    data: product,
    isLoading,
    isError,
  } = useProductByEan(searchedEan);

  React.useEffect(() => {
    if (product?.uid) {
      navigate(`/dashboard/products/${product.uid}`);
    }
  }, [product, navigate]);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setHasSearched(true);
    setSearchedEan(trimmed);
  };

  const showNotFound = hasSearched && !isLoading && isError;

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <Card>
        <Title level={3}>Rechercher un produit par EAN</Title>

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Input
            placeholder="Entrer le code EAN"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
          />

          <Button type="primary" onClick={handleSearch} loading={isLoading}>
            Rechercher
          </Button>

          {isLoading && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <Spin />
            </div>
          )}

          {showNotFound && (
            <Alert
              type="warning"
              showIcon
              message="Produit introuvable"
              description={
                <Space direction="vertical" size="small">
                  <Text>
                    Aucun produit n&apos;existe avec cet EAN.
                  </Text>
                  <Button
                    type="primary"
                    onClick={() => navigate("/dashboard/products/create")}
                  >
                    Créer le produit
                  </Button>
                </Space>
              }
            />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default SearchProductByEanPage;