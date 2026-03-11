import React, { useState } from "react";
import { Table, Button, Modal, message, Space, Popconfirm } from "antd";
import type { Story } from "../../../lib/entities";
import { useDeleteStory, useStories } from "../../../hooks/useStory";
import CreateStoryForm from "./create-story-form";
import type { ColumnsType } from "antd/es/table";

const StoriesList: React.FC = () => {
  const { data, isLoading } = useStories();
  const deleteStory = useDeleteStory();

  const [creating, setCreating] = useState(false);

  const stories: Story[] = Array.isArray(data) ? data : [];

  const columns: ColumnsType<Story> = [
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
            alt="Story"
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
      title: "Vidéos",
      dataIndex: "videos",
      key: "videos",
      render: (videos: string[]) => <span>{Array.isArray(videos) ? videos.length : 0}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Story) => (
        <Space>
          <Popconfirm
            title="Supprimer cette story ?"
            onConfirm={async () => {
              await deleteStory.mutateAsync(record.id);
              message.success("Story supprimée");
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
        Créer une story
      </Button>

      <Table
        columns={columns}
        dataSource={stories}
        rowKey="id"
        loading={isLoading}
        pagination={false}
      />

      <Modal
        title="Créer une story"
        open={creating}
        onCancel={() => setCreating(false)}
        onOk={() => {
          const el = document.getElementById("create-story-form");
          if (el) {
            el.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
          }
        }}
        destroyOnClose
        okText="Valider"
        cancelText="Annuler"
      >
        <CreateStoryForm onSuccess={() => setCreating(false)} />
      </Modal>
    </>
  );
};

export default StoriesList;

