import React, { useState } from "react";
import { Table, Input, Button, Modal, Form, message, Space, Popconfirm } from "antd";
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand, useSearchBrands } from "../../../hooks/useBrand";
import { useNavigate } from "react-router-dom";
import type { Brand } from "../../../lib/entities";

const PAGE_SIZE = 20;

const BrandsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Brand | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useBrands(page, PAGE_SIZE);
  const { data: searchResults, isLoading: isSearching } = useSearchBrands(search);
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const navigate = useNavigate();

  const brands = search
    ? (Array.isArray(searchResults) ? searchResults : [])
    : (Array.isArray(data) ? data : []);
  const total = search ? brands.length : 14000;

  const columns = [
    {
      title: "Nom de la marque",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: Brand) => (
        <a onClick={() => navigate(`/dashboard/products?brandId=${record.id}`)} style={{ fontWeight: 500 }}>
          {record.name}
        </a>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Brand) => (
        <Space>
          <Button type="link" onClick={() => setEditing(record)}>Modifier</Button>
          <Popconfirm
            title="Supprimer cette marque ?"
            onConfirm={async () => {
              await deleteBrand.mutateAsync(record.id);
              message.success("Marque supprimée");
            }}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="link" danger>Supprimer</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = async (values: Partial<Brand>) => {
    if (!editing) return;
    await updateBrand.mutateAsync({ id: editing.id, data: values });
    message.success("Marque mise à jour !");
    setEditing(null);
  };

  const handleCreate = async (values: Partial<Brand>) => {
    await createBrand.mutateAsync(values);
    message.success("Marque ajoutée !");
    setCreating(false);
  };

  return (
    <>
      <Input.Search
        placeholder="Rechercher une marque..."
        onSearch={setSearch}
        allowClear
        style={{ width: 320, marginBottom: 16 }}
        enterButton
      />

      <Button
        type="primary"
        onClick={() => setCreating(true)}
        style={{ marginBottom: 16, float: 'right' }}
      >
        Ajouter une marque
      </Button>

      <Table
        columns={columns}
        dataSource={brands}
        rowKey="id"
        loading={isLoading || isSearching}
        pagination={
          search
            ? false
            : {
                current: page,
                pageSize: PAGE_SIZE,
                total: total,
                onChange: setPage,
                showSizeChanger: false,
              }
        }
      />

      {/* Edit/Create Modal */}
      <Modal
        title={editing ? "Modifier la marque" : "Ajouter une marque"}
        open={!!editing || creating}
        onCancel={() => {
          setEditing(null);
          setCreating(false);
        }}
        onOk={() => (document.getElementById(editing ? "edit-form" : "create-form") as any)
          .dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
        destroyOnClose
        okText="Valider"
        cancelText="Annuler"
      >
        <Form
          id={editing ? "edit-form" : "create-form"}
          layout="vertical"
          initialValues={editing || {}}
          onFinish={editing ? handleEdit : handleCreate}
        >
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: "Nom obligatoire" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BrandsList;
