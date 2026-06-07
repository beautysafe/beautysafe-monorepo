import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate, useParams } from "react-router-dom";
import type { ProductList } from "../../../lib/entities";
import {
  useCreateProductList,
  useDeleteProductList,
  useUpdateProductList,
} from "../../../hooks/useProductList";
import { useSubgroupProductLists } from "../../../hooks/useSubGroup";

const ProductListsPage: React.FC = () => {
  const { subgroupId = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useSubgroupProductLists(subgroupId);
  const createProductList = useCreateProductList();
  const updateProductList = useUpdateProductList();
  const deleteProductList = useDeleteProductList();
  const [form] = Form.useForm<Partial<ProductList>>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductList | null>(null);

  useEffect(() => {
    if (editing) form.setFieldsValue(editing);
    else form.resetFields();
  }, [editing, form, open]);

  const submit = async (values: Partial<ProductList>) => {
    try {
      if (editing) {
        await updateProductList.mutateAsync({ id: editing.id, data: values });
        message.success("Product list mise à jour");
      } else {
        await createProductList.mutateAsync({ subgroupId, data: values });
        message.success("Product list créée");
      }
      setOpen(false);
      setEditing(null);
    } catch {
      message.error("Erreur lors de l'enregistrement");
    }
  };

  const columns: ColumnsType<ProductList> = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nom", dataIndex: "name", key: "name" },
    { title: "Titre", dataIndex: "title", key: "title" },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ProductList) => (
        <Space>
          <Button onClick={() => navigate(`/dashboard/product-lists/${record.id}/products`)}>
            Produits
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
            title="Supprimer cette product list ?"
            onConfirm={async () => {
              await deleteProductList.mutateAsync(record.id);
              message.success("Product list supprimée");
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
        Créer une product list
      </Button>
      <Table columns={columns} dataSource={data ?? []} rowKey="id" loading={isLoading} />
      <Modal
        title={editing ? "Modifier la product list" : "Créer une product list"}
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

export default ProductListsPage;
