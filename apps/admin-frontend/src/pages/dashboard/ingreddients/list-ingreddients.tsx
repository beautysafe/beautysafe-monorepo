import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  InputNumber,
} from "antd";
import {
  useIngreddients,
  useUpdateIngredient,
  useCreateIngredient,
  useDeleteIngredient,
  useSearchIngredients,
} from "../../../hooks/useIngredient";
import type { Ingredient } from "../../../lib/entities";

const PAGE_SIZE = 20;

const submitForm = (formId: string) => {
  document
    .getElementById(formId)
    ?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
};

const IngredientsList: React.FC<{ status?: Ingredient["status"] }> = ({
  status = "ACTIVE",
}) => {
  const [page, setPage] = useState(1);
  const [nameSearch, setNameSearch] = useState("");
  const [officialNameSearch, setOfficialNameSearch] = useState("");
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useIngreddients(page, PAGE_SIZE, status);
  const { data: searchResults, isLoading: isSearching } = useSearchIngredients(
    nameSearch,
    officialNameSearch,
    status,
  );
  const updateIngredient = useUpdateIngredient();
  const createIngredient = useCreateIngredient();
  const deleteIngredient = useDeleteIngredient();

  const hasSearch = Boolean(nameSearch || officialNameSearch);
  const ingredients = hasSearch
    ? Array.isArray(searchResults)
      ? searchResults
      : []
    : Array.isArray(data)
      ? data
      : [];

  const total = hasSearch ? ingredients.length : 12000;

  const columns = [
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: Ingredient) => {
        const isNumber = !isNaN(Number(record.name));
        return isNumber ? record.officialName : record.name;
      },
    },
    {
      title: "Nom officiel",
      dataIndex: "officialName",
      key: "officialName",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (value: Ingredient["status"]) =>
        value === "NEW" ? "Nouveau" : "Actif",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_value: unknown, record: Ingredient) => (
        <Space>
          <Button type="link" onClick={() => setEditing(record)}>
            Modifier
          </Button>
          {status === "NEW" && (
            <Popconfirm
              title="Confirmer cet ingrédient ?"
              description="Il apparaîtra dans la liste normale des ingrédients."
              onConfirm={async () => {
                await updateIngredient.mutateAsync({
                  id: record.id,
                  data: { status: "ACTIVE" },
                });
                message.success("Ingrédient confirmé");
              }}
              okText="Confirmer"
              cancelText="Annuler"
            >
              <Button type="link">Confirmer</Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Supprimer cet ingrédient ?"
            onConfirm={async () => {
              await deleteIngredient.mutateAsync(record.id);
              message.success("Ingrédient supprimé");
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

  // Handlers for edit and create (make sure score is number)
  const handleEdit = async (values: Partial<Ingredient>) => {
    if (!editing) return;
    if (values.score !== undefined) values.score = Number(values.score);
    await updateIngredient.mutateAsync({ id: editing.id, data: values });
    message.success("Ingrédient mis à jour !");
    setEditing(null);
  };

  const handleCreate = async (values: Partial<Ingredient>) => {
    if (values.score !== undefined) values.score = Number(values.score);
    await createIngredient.mutateAsync(values);
    message.success("Ingrédient ajouté !");
    setCreating(false);
  };

  return (
    <>
      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Rechercher par nom..."
          value={nameSearch}
          onChange={(event) => setNameSearch(event.target.value)}
          onSearch={setNameSearch}
          onClear={() => setNameSearch("")}
          allowClear
          style={{ width: 320 }}
          enterButton
        />
        <Input.Search
          placeholder="Rechercher par nom officiel..."
          value={officialNameSearch}
          onChange={(event) => setOfficialNameSearch(event.target.value)}
          onSearch={setOfficialNameSearch}
          onClear={() => setOfficialNameSearch("")}
          allowClear
          style={{ width: 320 }}
          enterButton
        />
      </Space>

      {status === "ACTIVE" && (
        <Button
          type="primary"
          onClick={() => setCreating(true)}
          style={{ marginBottom: 16, float: "right" }}
        >
          Ajouter un ingrédient
        </Button>
      )}

      <Table
        columns={columns}
        dataSource={ingredients}
        rowKey="id"
        loading={isLoading || isSearching}
        pagination={
          hasSearch
            ? false // No pagination in search mode, unless your API supports it
            : {
                current: page,
                pageSize: PAGE_SIZE,
                total: total,
                onChange: setPage,
                showSizeChanger: false,
              }
        }
      />

      {/* Edit Modal */}
      <Modal
        title="Modifier l’ingrédient"
        open={!!editing}
        onCancel={() => setEditing(null)}
        onOk={() => submitForm("edit-form")}
        confirmLoading={updateIngredient.isPending}
        destroyOnClose
      >
        <Form
          id="edit-form"
          layout="vertical"
          initialValues={editing || {}}
          onFinish={handleEdit}
        >
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="officialName"
            label="Nom officiel"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="score" label="Score">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Modal */}
      <Modal
        title="Ajouter un ingrédient"
        open={creating}
        onCancel={() => setCreating(false)}
        onOk={() => submitForm("create-form")}
        confirmLoading={createIngredient.isPending}
        destroyOnClose
      >
        <Form id="create-form" layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="officialName"
            label="Nom officiel"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="score" label="Score">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default IngredientsList;
