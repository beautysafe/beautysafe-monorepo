import React from "react";
import {
  Table,
  message,
  Input,
  Button,
  Select,
  Row,
  Col,
  Modal,
  Spin,
} from "antd";
import {
  useProductByEan,
  useProductsByFlag,
  useProductsByCategory,
} from "../../../hooks/useProduct";
import type { Product } from "../../../lib/entities";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFlags } from "../../../hooks/useFlag";
import { useCategories } from "../../../hooks/useCategory";
import CreateProductForm from "./create-product-form";

const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("CategoryId");

  const [createVisible, setCreateVisible] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedFlag, setSelectedFlag] = React.useState<number | undefined>();
  const [selectedCategory, setSelectedCategory] = React.useState<number | undefined>();
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);

  const { data: flags = [], isLoading: flagsLoading } = useFlags();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: foundProduct, isLoading: isSearching, error: searchError } = useProductByEan(search);
  const { data: productsByFlag } = useProductsByFlag(selectedFlag!);
  const { data: productsByCategory } = useProductsByCategory(categoryId!, page, limit);

  React.useEffect(() => {
    if (searchError) {
      message.error("Aucun produit trouvé avec cet EAN");
    }
  }, [searchError]);

  const columns = [
    { title: "ID", dataIndex: "uid" },
    { title: "Nom", dataIndex: "name" },
    {
      title: "Marque",
      dataIndex: "brand",
      render: (brand: { name: string }) => brand?.name || "—",
    },
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

let tableData: Product[] = [];
let total = 0;

if (search && foundProduct) {
  tableData = [foundProduct];
  total = 1;
} else if (selectedFlag && productsByFlag) {
  tableData = productsByFlag;
  total = productsByFlag.length;
} else if (categoryId && productsByCategory) {
  tableData = productsByCategory.data;
  total = productsByCategory.total;
}

  return (
    <>
      <Modal
        open={createVisible}
        title="Ajouter un produit"
        onCancel={() => setCreateVisible(false)}
        footer={null}
        destroyOnClose
      >
        <CreateProductForm
          onSuccess={() => setCreateVisible(false)}
        />
      </Modal>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Input.Search
            placeholder="Rechercher par EAN"
            allowClear
            style={{ width: 430 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            enterButton="Chercher"
            loading={isSearching}
            onSearch={(val) => {
              setSearch(val.trim());
              setSelectedCategory(undefined);
              setSelectedFlag(undefined);
            }}
          />
        </Col>
        <Col>
          <Button
            onClick={() => {
              setSearch("");
              setSelectedCategory(undefined);
              setSelectedFlag(undefined);
            }}
          >
            Réinitialiser
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            style={{ marginBottom: 16 }}
            onClick={() => setCreateVisible(true)}
          >
            Ajouter un produit
          </Button>
        </Col>
      </Row>

      <Spin
        spinning={
          isSearching ||
          flagsLoading ||
          categoriesLoading
        }
      >
        <Table<Product>
          dataSource={tableData}
          rowKey="uid"
          columns={columns}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            onChange: (newPage) => setPage(newPage),
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/dashboard/products/${record.uid}`),
            style: { cursor: "pointer" },
          })}
        />
      </Spin>
    </>
  );
};

export default ProductsList;