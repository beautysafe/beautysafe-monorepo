import React from "react";
import { Table, Button, message, Space, Popconfirm, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import type { Banner } from "../../../lib/entities";
import { useBanners, useDeleteBanner } from "../../../hooks/useBanner";
import type { ColumnsType } from "antd/es/table";

const BannersList: React.FC = () => {
  const { data, isLoading } = useBanners();
  const deleteBanner = useDeleteBanner();
  const navigate = useNavigate();

  const banners: Banner[] = Array.isArray(data) ? data : [];

  const columns: ColumnsType<Banner> = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Titre",
      dataIndex: "title",
      key: "title",
      render: (title: string | null | undefined, record: Banner) => (
        <Button
          type="link"
          onClick={() => navigate(`/dashboard/banners/${record.id}`)}
          style={{ padding: 0 }}
        >
          {title || `Bannière #${record.id}`}
        </Button>
      ),
    },
    {
      title: "Statut",
      dataIndex: "published",
      key: "published",
      render: (published: boolean) => (
        <Tag color={published ? "green" : "default"}>
          {published ? "Publiée" : "Brouillon"}
        </Tag>
      ),
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image: string) =>
        image ? (
          <img
            src={image}
            alt="Bannière"
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

    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Banner) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate(`/dashboard/banners/${record.id}`)}
          >
            Afficher
          </Button>
          <Button
            type="link"
            onClick={() => navigate(`/dashboard/banners/${record.id}/edit`)}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Supprimer cette bannière ?"
            onConfirm={async () => {
              try {
                await deleteBanner.mutateAsync(record.id);
                message.success("Bannière supprimée");
              } catch {
                message.error("La suppression de la bannière a échoué");
              }
            }}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="link" danger>
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button
        type="primary"
        onClick={() => navigate("/dashboard/banners/create")}
        style={{ marginBottom: 16, float: "right" }}
      >
        Créer une bannière
      </Button>

      <Table
        columns={columns}
        dataSource={banners}
        rowKey="id"
        loading={isLoading}
        pagination={false}
      />
    </>
  );
};

export default BannersList;
