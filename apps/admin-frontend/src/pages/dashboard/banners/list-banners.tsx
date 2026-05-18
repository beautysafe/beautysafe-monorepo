import React, { useState } from "react";
import { Table, Button, Modal, message, Space, Popconfirm } from "antd";
import type { Banner } from "../../../lib/entities";
import { useBanners, useDeleteBanner } from "../../../hooks/useBanner";
import CreateBannerForm from "./create-banner-form";
import type { ColumnsType } from "antd/es/table";

const BannersList: React.FC = () => {
  const { data, isLoading } = useBanners();
  const deleteBanner = useDeleteBanner();

  const [creating, setCreating] = useState(false);

  const banners: Banner[] = Array.isArray(data) ? data : [];

  const columns: ColumnsType<Banner> = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Titre", dataIndex: "title", key: "title" },
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
          <Popconfirm
            title="Supprimer cette bannière ?"
            onConfirm={async () => {
              await deleteBanner.mutateAsync(record.id);
              message.success("Bannière supprimée");
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
        onClick={() => setCreating(true)}
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

      <Modal
        title="Créer une bannière"
        open={creating}
        onCancel={() => setCreating(false)}
        onOk={() => {
          const el = document.getElementById("create-banner-form");
          if (el) {
            el.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
          }
        }}
        destroyOnClose
        okText="Valider"
        cancelText="Annuler"
      >
        <CreateBannerForm onSuccess={() => setCreating(false)} />
      </Modal>
    </>
  );
};

export default BannersList;

