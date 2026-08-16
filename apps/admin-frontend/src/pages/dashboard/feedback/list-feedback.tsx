import { StarFilled } from "@ant-design/icons";
import {
  Button,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useDeleteProductFeedback,
  useProductFeedback,
} from "../../../hooks/useProductFeedback";
import type { ProductFeedback } from "../../../lib/entities";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const Rating = ({ value }: { value: number }) => (
  <span style={{ whiteSpace: "nowrap" }}>
    <StarFilled style={{ color: "#fadb14", marginRight: 4 }} />
    {value.toFixed(1)} / 5
  </span>
);

const FeedbackPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [q, setQ] = useState("");
  const [productId, setProductId] = useState<number>();
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const { data, isLoading } = useProductFeedback({
    page,
    limit,
    q: q || undefined,
    productId,
    sort,
  });
  const deleteFeedback = useDeleteProductFeedback();

  const columns: ColumnsType<ProductFeedback> = [
    {
      title: "User",
      key: "user",
      render: (_, feedback) =>
        feedback.user?.fullName || feedback.user?.email || `#${feedback.userId}`,
    },
    {
      title: "Product",
      key: "product",
      render: (_, feedback) =>
        feedback.product ? (
          <Link to={`/dashboard/products/${feedback.product.uid}`}>
            {feedback.product.name}
          </Link>
        ) : (
          `#${feedback.productId}`
        ),
    },
    {
      title: "EAN",
      key: "ean",
      render: (_, feedback) => feedback.product?.ean || "—",
    },
    {
      title: "Effectiveness",
      dataIndex: "effectivenessRating",
      key: "effectivenessRating",
      render: (value: number) => <Tag color="blue">{value} / 5</Tag>,
    },
    {
      title: "Needs",
      dataIndex: "needsRating",
      key: "needsRating",
      render: (value: number) => <Tag color="cyan">{value} / 5</Tag>,
    },
    {
      title: "Repurchase",
      dataIndex: "repurchaseRating",
      key: "repurchaseRating",
      render: (value: number) => <Tag color="purple">{value} / 5</Tag>,
    },
    {
      title: "Average",
      dataIndex: "averageRating",
      key: "averageRating",
      render: (value: number) => <Rating value={value} />,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      width: 240,
      render: (comment: string | null) =>
        comment ? (
          <Typography.Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
            style={{ margin: 0, maxWidth: 240 }}
          >
            {comment}
          </Typography.Paragraph>
        ) : (
          "—"
        ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, feedback) => (
        <Popconfirm
          title="Delete this feedback?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          onConfirm={async () => {
            try {
              await deleteFeedback.mutateAsync(feedback.id);
              message.success("Feedback deleted");
            } catch {
              message.error("Deletion failed");
            }
          }}
        >
          <Button type="link" danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Typography.Title level={3}>Product Feedback</Typography.Title>
      <Space wrap style={{ width: "100%", marginBottom: 16 }}>
        <Input.Search
          allowClear
          value={searchText}
          placeholder="Search product, EAN, or user"
          style={{ width: 320 }}
          onChange={(event) => {
            setSearchText(event.target.value);
            if (!event.target.value) {
              setQ("");
              setPage(1);
            }
          }}
          onSearch={(value) => {
            setQ(value.trim());
            setPage(1);
          }}
        />
        <InputNumber
          min={1}
          value={productId}
          placeholder="Product UID"
          style={{ width: 150 }}
          onChange={(value) => {
            setProductId(typeof value === "number" ? value : undefined);
            setPage(1);
          }}
        />
        <Select
          value={sort}
          style={{ width: 150 }}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
          ]}
          onChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        />
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading}
        scroll={{ x: 1450 }}
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.total ?? 0,
          showSizeChanger: true,
          showTotal: (total) => `${total} ratings`,
          onChange: (nextPage, nextLimit) => {
            setPage(nextLimit !== limit ? 1 : nextPage);
            setLimit(nextLimit);
          },
        }}
      />
    </>
  );
};

export default FeedbackPage;
