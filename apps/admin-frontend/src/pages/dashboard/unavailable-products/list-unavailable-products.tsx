import {
  Button,
  Descriptions,
  Drawer,
  Image,
  Input,
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
import {
  useDeleteUnavailableProduct,
  useUnavailableProducts,
  useUpdateUnavailableProduct,
} from "../../../hooks/useUnavailableProduct";
import type {
  UnavailableProduct,
  UnavailableProductStatus,
} from "../../../lib/entities";

const statusLabels: Record<UnavailableProductStatus, string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  ADDED: "Added",
  REJECTED: "Rejected",
};

const statusColors: Record<UnavailableProductStatus, string> = {
  PENDING: "gold",
  REVIEWING: "blue",
  ADDED: "green",
  REJECTED: "red",
};

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value: value as UnavailableProductStatus,
  label,
}));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const UnavailableProductsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<UnavailableProductStatus>();
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selected, setSelected] = useState<UnavailableProduct>();

  const { data, isLoading } = useUnavailableProducts({
    page,
    limit,
    q: q || undefined,
    status,
    sort,
  });
  const updateSubmission = useUpdateUnavailableProduct();
  const deleteSubmission = useDeleteUnavailableProduct();

  const changeStatus = async (
    submission: UnavailableProduct,
    nextStatus: UnavailableProductStatus,
  ) => {
    try {
      const updated = await updateSubmission.mutateAsync({
        id: submission.id,
        status: nextStatus,
      });
      if (selected?.id === updated.id) setSelected(updated);
      message.success("Statut mis à jour");
    } catch {
      message.error("La mise à jour du statut a échoué");
    }
  };

  const columns: ColumnsType<UnavailableProduct> = [
    {
      title: "Preview",
      key: "preview",
      width: 86,
      render: (_, submission) =>
        submission.imageUrls[0] ? (
          <Image
            src={submission.imageUrls[0]}
            alt={submission.productName || `Submission ${submission.id}`}
            width={56}
            height={56}
            style={{ objectFit: "cover", borderRadius: 6 }}
          />
        ) : (
          "—"
        ),
    },
    {
      title: "EAN",
      dataIndex: "ean",
      key: "ean",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Product name",
      dataIndex: "productName",
      key: "productName",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Brand",
      dataIndex: "brandName",
      key: "brandName",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Images",
      key: "images",
      width: 86,
      render: (_, submission) => submission.imageUrls.length,
    },
    {
      title: "Status",
      key: "status",
      width: 145,
      render: (_, submission) => (
        <Space direction="vertical" size={2}>
          <Tag color={statusColors[submission.status]}>
            {statusLabels[submission.status]}
          </Tag>
          <Select
            value={submission.status}
            options={statusOptions}
            size="small"
            style={{ width: 125 }}
            loading={updateSubmission.isPending}
            onChange={(value) => void changeStatus(submission, value)}
          />
        </Space>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, submission) => (
        <Space>
          <Button type="link" onClick={() => setSelected(submission)}>
            Details
          </Button>
          <Popconfirm
            title="Delete this submission?"
            description="Its managed Firebase images will also be removed."
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={async () => {
              try {
                await deleteSubmission.mutateAsync(submission.id);
                if (selected?.id === submission.id) setSelected(undefined);
                message.success("Submission deleted");
              } catch {
                message.error("Deletion failed");
              }
            }}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Typography.Title level={3}>Unavailable Products</Typography.Title>
      <Space wrap style={{ width: "100%", marginBottom: 16 }}>
        <Input.Search
          allowClear
          value={searchText}
          placeholder="Search EAN, product, or brand"
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
        <Select
          allowClear
          placeholder="All statuses"
          value={status}
          options={statusOptions}
          style={{ width: 160 }}
          onChange={(value) => {
            setStatus(value);
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
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.total ?? 0,
          showSizeChanger: true,
          showTotal: (total) => `${total} submissions`,
          onChange: (nextPage, nextLimit) => {
            setPage(nextLimit !== limit ? 1 : nextPage);
            setLimit(nextLimit);
          },
        }}
      />

      <Drawer
        open={Boolean(selected)}
        title={selected ? `Submission #${selected.id}` : "Submission"}
        width={640}
        onClose={() => setSelected(undefined)}
      >
        {selected && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Status">
                <Tag color={statusColors[selected.status]}>
                  {statusLabels[selected.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="EAN">{selected.ean || "—"}</Descriptions.Item>
              <Descriptions.Item label="Product">
                {selected.productName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Brand">
                {selected.brandName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="User">
                {selected.user
                  ? selected.user.fullName || selected.user.email || `#${selected.user.id}`
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Notes">
                {selected.notes || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {formatDate(selected.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Resolved product">
                {selected.resolvedProduct
                  ? `${selected.resolvedProduct.name} (${selected.resolvedProduct.ean})`
                  : "—"}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Typography.Title level={5}>Photos</Typography.Title>
              <Image.PreviewGroup>
                <Space wrap align="start">
                  {selected.imageUrls.map((url, index) => (
                    <Image
                      key={url}
                      src={url}
                      alt={`Submission ${selected.id}, photo ${index + 1}`}
                      width={160}
                      height={160}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            </div>

            <Select
              value={selected.status}
              options={statusOptions}
              style={{ width: "100%" }}
              loading={updateSubmission.isPending}
              onChange={(value) => void changeStatus(selected, value)}
            />
          </Space>
        )}
      </Drawer>
    </>
  );
};

export default UnavailableProductsPage;
