import React from "react";
import {
  Table,
  message,
  Input,
  Button,
  Row,
  Col,
  Modal,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useProductByEan, useProductsByFlag } from "../../../hooks/useProduct";
import { useFlagById } from "../../../hooks/useFlag";
import type { Product } from "../../../lib/entities";
import { useNavigate, useSearchParams } from "react-router-dom";
import CreateProductForm from "./create-product-form";

const cleanUrl = (value?: string | null): string | undefined => {
  const url = value?.trim();
  return url || undefined;
};

const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const flagIdParam = searchParams.get("flagId");
  const flagId = flagIdParam ? Number(flagIdParam) : undefined;

  const pageParam = searchParams.get("page");
  const page = pageParam ? Number(pageParam) : 1;

  const limit = 10;

  const { data: flagInfo, isLoading: isLoadingFlagInfo } = useFlagById(flagId!);

  const [createVisible, setCreateVisible] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const {
    data: foundProduct,
    isLoading: isSearching,
    error: searchError,
  } = useProductByEan(search);

  const { data: productsByFlag, isLoading: isLoadingByFlag } =
    useProductsByFlag(flagId, page, limit);

  React.useEffect(() => {
    if (searchError) {
      message.error("Aucun produit trouvé avec cet EAN");
    }
  }, [searchError]);

  React.useEffect(() => {
    const currentPage = searchParams.get("page");

    if (!currentPage) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("page", "1");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(newPage));

    setSearchParams(nextParams);
  };

  const resetSearch = () => {
    setSearch("");

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", "1");

    setSearchParams(nextParams);
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
      title: "Marque",
      dataIndex: "brand",
      key: "brand",
      render: (brand: { name?: string }) => brand?.name || "—",
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

  let tableData: Product[] = [];
  let total = 0;

  if (search && foundProduct) {
    tableData = [foundProduct];
    total = 1;
  } else if (flagId) {
    tableData = productsByFlag?.data ?? [];
    total = flagInfo?.totalProducts ?? 0;
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
        <CreateProductForm onSuccess={() => setCreateVisible(false)} />
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

              const nextParams = new URLSearchParams(searchParams);
              nextParams.set("page", "1");
              setSearchParams(nextParams);
            }}
          />
        </Col>

        <Col>
          <Button onClick={resetSearch}>Réinitialiser</Button>
        </Col>

        <Col>
          <Button type="primary" onClick={() => setCreateVisible(true)}>
            Ajouter un produit
          </Button>
        </Col>
      </Row>

      <Spin
        spinning={
          isSearching || Boolean(flagId && (isLoadingByFlag || isLoadingFlagInfo))
        }
      >
        <Table<Product>
          dataSource={tableData}
          rowKey="uid"
          columns={columns}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showQuickJumper: true,
            showSizeChanger: false,
            onChange: handlePageChange,
          }}
          onRow={(record) => ({
            onClick: () => {
              navigate(`/dashboard/products/${record.uid}`);
            },
            style: { cursor: "pointer" },
          })}
        />
      </Spin>
    </>
  );
};

export default ProductsList;