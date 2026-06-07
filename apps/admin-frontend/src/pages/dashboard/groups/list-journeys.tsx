import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate, useParams } from "react-router-dom";
import type { Journey } from "../../../lib/entities";
import {
  useCreateJourney,
  useDeleteJourney,
  useUpdateJourney,
} from "../../../hooks/useJourney";
import { useSubgroupJourneys } from "../../../hooks/useSubGroup";

const JourneysPage: React.FC = () => {
  const { subgroupId = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useSubgroupJourneys(subgroupId);
  const createJourney = useCreateJourney();
  const updateJourney = useUpdateJourney();
  const deleteJourney = useDeleteJourney();
  const [form] = Form.useForm<Partial<Journey>>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Journey | null>(null);

  useEffect(() => {
    if (editing) form.setFieldsValue(editing);
    else form.resetFields();
  }, [editing, form, open]);

  const submit = async (values: Partial<Journey>) => {
    try {
      if (editing) {
        await updateJourney.mutateAsync({ id: editing.id, data: values });
        message.success("Journey mise à jour");
      } else {
        await createJourney.mutateAsync({ subgroupId, data: values });
        message.success("Journey créée");
      }
      setOpen(false);
      setEditing(null);
    } catch {
      message.error("Erreur lors de l'enregistrement");
    }
  };

  const columns: ColumnsType<Journey> = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nom", dataIndex: "name", key: "name" },
    { title: "Titre", dataIndex: "title", key: "title" },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Journey) => (
        <Space>
          <Button onClick={() => navigate(`/dashboard/journeys/${record.id}`)}>
            Gérer
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
            title="Supprimer cette journey ?"
            onConfirm={async () => {
              await deleteJourney.mutateAsync(record.id);
              message.success("Journey supprimée");
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
        Créer une journey
      </Button>
      <Table columns={columns} dataSource={data ?? []} rowKey="id" loading={isLoading} />
      <Modal
        title={editing ? "Modifier la journey" : "Créer une journey"}
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

export default JourneysPage;
