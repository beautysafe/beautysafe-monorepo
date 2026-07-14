import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate, useParams } from "react-router-dom";
import type { SubGroupJourney } from "../../../lib/entities";
import { useGroupSubgroups } from "../../../hooks/useGroup";
import {
  useCreateSubgroup,
  useDeleteSubgroup,
  useUpdateSubgroup,
} from "../../../hooks/useSubGroup";
import {
  ImageUploadField,
  type ImageUploadValue,
} from "../../../components/uploads/ImageUploadField";
import { deleteUploadedFile } from "../../../services/upload.service";

const GroupSubgroupsPage: React.FC = () => {
  const { groupId = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGroupSubgroups(groupId);
  const createSubgroup = useCreateSubgroup();
  const updateSubgroup = useUpdateSubgroup();
  const deleteSubgroup = useDeleteSubgroup();
  const [form] = Form.useForm<Partial<SubGroupJourney>>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SubGroupJourney | null>(null);
  const [image, setImage] = useState<ImageUploadValue | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadCommitted, setUploadCommitted] = useState(false);

  useEffect(() => {
    if (editing) {
      form.setFieldsValue(editing);
      setImage(
        editing.imageUrl
          ? {
              url: editing.imageUrl,
              storagePath: editing.imageKey ?? undefined,
              isNew: false,
            }
          : null,
      );
    } else {
      form.resetFields();
      setImage(null);
    }
    setUploadCommitted(false);
  }, [editing, form, open]);

  const submit = async (values: Partial<SubGroupJourney>) => {
    try {
      if (imageUploading) {
        message.error("Attendez la fin de l'envoi de l'image");
        return;
      }
      const payload: Partial<SubGroupJourney> = {
        ...values,
        imageUrl: image?.url ?? null,
        imageKey: image?.storagePath ?? null,
      };
      if (editing) {
        await updateSubgroup.mutateAsync({ id: editing.id, data: payload });
        message.success("Sous-groupe mis à jour");
      } else {
        await createSubgroup.mutateAsync({ groupId, data: payload });
        message.success("Sous-groupe créé");
      }
      setUploadCommitted(true);
      setTimeout(() => {
        setOpen(false);
        setEditing(null);
      }, 0);
    } catch {
      if (image?.isNew && image.storagePath) {
        await deleteUploadedFile(image.storagePath).catch(() => undefined);
        setImage(
          editing?.imageUrl
            ? {
                url: editing.imageUrl,
                storagePath: editing.imageKey ?? undefined,
                isNew: false,
              }
            : null,
        );
      }
      message.error("Erreur lors de l'enregistrement");
    }
  };

  const columns: ColumnsType<SubGroupJourney> = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nom", dataIndex: "name", key: "name" },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string) =>
        imageUrl ? (
          <img src={imageUrl} alt="Sous-groupe" style={{ width: 52, height: 52, objectFit: "cover" }} />
        ) : null,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: SubGroupJourney) => (
        <Space>
          <Button onClick={() => navigate(`/dashboard/subgroups/${record.id}/product-lists`)}>
            Product lists
          </Button>
          <Button onClick={() => navigate(`/dashboard/subgroups/${record.id}/journeys`)}>
            Journeys
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
            title="Supprimer ce sous-groupe ?"
            onConfirm={async () => {
              await deleteSubgroup.mutateAsync(record.id);
              message.success("Sous-groupe supprimé");
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
        Créer un sous-groupe
      </Button>
      <Table columns={columns} dataSource={data ?? []} rowKey="id" loading={isLoading} />
      <Modal
        title={editing ? "Modifier le sous-groupe" : "Créer un sous-groupe"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        onOk={() => form.submit()}
        okButtonProps={{
          disabled: imageUploading,
          loading: createSubgroup.isPending || updateSubgroup.isPending,
        }}
        okText="Valider"
        cancelText="Annuler"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: "Nom obligatoire" }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <ImageUploadField
              label="Image"
              folder="subgroups"
              value={image}
              onChange={setImage}
              onUploadingChange={setImageUploading}
              disabled={createSubgroup.isPending || updateSubgroup.isPending}
              committed={uploadCommitted}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GroupSubgroupsPage;
