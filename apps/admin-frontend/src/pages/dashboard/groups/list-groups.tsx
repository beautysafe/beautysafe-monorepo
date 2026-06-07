import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import type { Group } from "../../../lib/entities";
import {
  useCreateGroup,
  useDeleteGroup,
  useGroups,
  useUpdateGroup,
} from "../../../hooks/useGroup";

const GroupsList: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const [form] = Form.useForm<Partial<Group>>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);

  useEffect(() => {
    if (editing) form.setFieldsValue(editing);
    else form.resetFields();
  }, [editing, form, open]);

  const submit = async (values: Partial<Group>) => {
    try {
      if (editing) {
        await updateGroup.mutateAsync({ id: editing.id, data: values });
        message.success("Groupe mis à jour");
      } else {
        await createGroup.mutateAsync(values);
        message.success("Groupe créé");
      }
      setOpen(false);
      setEditing(null);
    } catch {
      message.error("Erreur lors de l'enregistrement");
    }
  };

  const columns: ColumnsType<Group> = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nom", dataIndex: "name", key: "name" },
    { title: "Titre", dataIndex: "title", key: "title" },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string) =>
        imageUrl ? (
          <img src={imageUrl} alt="Groupe" style={{ width: 52, height: 52, objectFit: "cover" }} />
        ) : null,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Group) => (
        <Space>
          <Button onClick={() => navigate(`/dashboard/groups/${record.id}/subgroups`)}>
            Sous-groupes
          </Button>
          <Button
            onClick={() => {
              setEditing(record);
              setOpen(true);
            }}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Supprimer ce groupe ?"
            onConfirm={async () => {
              await deleteGroup.mutateAsync(record.id);
              message.success("Groupe supprimé");
            }}
          >
            <Button danger>Supprimer</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)} style={{ marginBottom: 16, float: "right" }}>
        Créer un groupe
      </Button>

      <Table columns={columns} dataSource={data ?? []} rowKey="id" loading={isLoading} />

      <Modal
        title={editing ? "Modifier le groupe" : "Créer un groupe"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        onOk={() => form.submit()}
        okText="Valider"
        cancelText="Annuler"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: "Nom obligatoire" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="imageUrl" label="Image URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="title" label="Titre" rules={[{ required: true, message: "Titre obligatoire" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Description obligatoire" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GroupsList;
