import React, { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate, useParams } from "react-router-dom";
import type { Brand, Ingredient, Product } from "../../../lib/entities";
import { searchBrands } from "../../../services/brand.service";
import { searchIngredients } from "../../../services/ingredient.service";
import { searchProducts, type SearchProductsParams } from "../../../services/product.service";
import { useAddProductListProducts } from "../../../hooks/useProductList";

const PAGE_SIZE = 100;

type Option = {
  label: string;
  value: number;
};

const toOption = (item: Brand | Ingredient): Option => ({
  label: item.name,
  value: item.id,
});

const normalizeResults = (products: Product[]) =>
  products.filter((product) => Boolean(product.ean));

const toNullableNumber = (value: string | number | null) => {
  if (value === null) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const SelectGroupProductsPage: React.FC = () => {
  const { productListId = "" } = useParams();
  const navigate = useNavigate();
  const addProducts = useAddProductListProducts();

  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [includeIngredientOptions, setIncludeIngredientOptions] = useState<Option[]>([]);
  const [excludeIngredientOptions, setExcludeIngredientOptions] = useState<Option[]>([]);
  const [brandIds, setBrandIds] = useState<number[]>([]);
  const [includeIngredientIds, setIncludeIngredientIds] = useState<number[]>([]);
  const [excludeIngredientIds, setExcludeIngredientIds] = useState<number[]>([]);
  const [requireAllIngredients, setRequireAllIngredients] = useState(false);
  const [minScore, setMinScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, Product>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const selectedEans = useMemo(() => Object.keys(selectedProducts), [selectedProducts]);

  const loadBrands = async (query: string) => {
    if (!query.trim()) return;
    try {
      const results = await searchBrands(query);
      setBrandOptions(results.map(toOption));
    } catch {
      message.error("Erreur lors de la recherche des marques");
    }
  };

  const loadIngredients =
    (setOptions: React.Dispatch<React.SetStateAction<Option[]>>) => async (query: string) => {
      if (!query.trim()) return;
      try {
        const results = await searchIngredients(query);
        setOptions(results.map(toOption));
      } catch {
        message.error("Erreur lors de la recherche des ingrédients");
      }
    };

  const runSearch = async (nextPage = 1) => {
    const params: SearchProductsParams = {
      brandIds,
      includeIngredientIds,
      excludeIngredientIds,
      requireAllIngredients,
      minScore: minScore ?? undefined,
      maxScore: maxScore ?? undefined,
      page: nextPage,
      limit: PAGE_SIZE,
    };

    setIsSearching(true);
    setSearchError("");

    try {
      const result = await searchProducts(params);
      setProducts(normalizeResults(result.data ?? []));
      setTotal(result.total ?? 0);
      setHasMore(Boolean(result.hasMore));
      setPage(result.page ?? nextPage);
      setHasSearched(true);
    } catch {
      setSearchError("Erreur lors de la recherche des produits");
      setProducts([]);
      setTotal(0);
      setHasMore(false);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const addSelectedProducts = async () => {
    if (!selectedEans.length) return;

    try {
      await addProducts.mutateAsync({ id: productListId, data: { eans: selectedEans } });
      message.success("Produits ajoutés");
      setSelectedProducts({});
      navigate(`/dashboard/product-lists/${productListId}/products`);
    } catch {
      message.error("Erreur lors de l'ajout des produits sélectionnés");
    }
  };

  const rowSelection = {
    selectedRowKeys: selectedEans,
    preserveSelectedRowKeys: true,
    onChange: (_keys: React.Key[], selectedRows: Product[]) => {
      setSelectedProducts((current) => {
        const visibleEans = new Set(products.map((product) => product.ean));
        const next = { ...current };

        visibleEans.forEach((ean) => {
          delete next[ean];
        });

        selectedRows.forEach((product) => {
          if (product.ean) next[product.ean] = product;
        });

        return next;
      });
    },
  };

  const columns: ColumnsType<Product> = [
    { title: "UID", dataIndex: "uid", key: "uid", width: 100 },
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{name}</span>,
    },
    { title: "EAN", dataIndex: "ean", key: "ean", width: 180 },
    {
      title: "Score",
      dataIndex: "validScore",
      key: "validScore",
      width: 100,
      render: (score: number) => <Tag>{score}</Tag>,
    },
  ];

  return (
    <>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Sélectionner un groupe de produits</h2>
        <Button onClick={() => navigate(`/dashboard/product-lists/${productListId}/products`)}>
          Retour
        </Button>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Marque">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  filterOption={false}
                  placeholder="Rechercher une marque"
                  options={brandOptions}
                  value={brandIds}
                  onSearch={loadBrands}
                  onChange={setBrandIds}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Ingrédients à inclure">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  filterOption={false}
                  placeholder="Rechercher des ingrédients"
                  options={includeIngredientOptions}
                  value={includeIngredientIds}
                  onSearch={loadIngredients(setIncludeIngredientOptions)}
                  onChange={setIncludeIngredientIds}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Ingrédients à exclure">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  filterOption={false}
                  placeholder="Rechercher des ingrédients"
                  options={excludeIngredientOptions}
                  value={excludeIngredientIds}
                  onSearch={loadIngredients(setExcludeIngredientOptions)}
                  onChange={setExcludeIngredientIds}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} align="bottom">
            <Col xs={24} md={8}>
              <Form.Item label="Score minimum">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  value={minScore}
                  onChange={(value) => setMinScore(toNullableNumber(value))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Score maximum">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  value={maxScore}
                  onChange={(value) => setMaxScore(toNullableNumber(value))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item>
                <Checkbox
                  checked={requireAllIngredients}
                  onChange={(event) => setRequireAllIngredients(event.target.checked)}
                >
                  Exiger tous les ingrédients
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" loading={isSearching} onClick={() => runSearch(1)}>
            Rechercher
          </Button>
        </Form>
      </Card>

      {searchError ? <Alert type="error" message={searchError} showIcon style={{ marginBottom: 16 }} /> : null}

      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
        <Button
          type="primary"
          disabled={!selectedEans.length}
          loading={addProducts.isPending}
          onClick={addSelectedProducts}
        >
          Ajouter les produits sélectionnés
        </Button>
        <span>{selectedEans.length} produit(s) sélectionné(s)</span>
      </Space>

      <Table<Product>
        columns={columns}
        dataSource={products}
        rowKey="ean"
        loading={isSearching}
        rowSelection={rowSelection}
        locale={{ emptyText: hasSearched ? "Aucun produit trouvé" : "Lancez une recherche" }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: total || (hasMore ? page * PAGE_SIZE + 1 : products.length),
          showSizeChanger: false,
          onChange: (nextPage) => runSearch(nextPage),
        }}
      />
    </>
  );
};

export default SelectGroupProductsPage;
