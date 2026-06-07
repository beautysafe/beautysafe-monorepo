import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import type { Ingredient, JourneyPhase, Product } from "../../../lib/entities";
import { useSearchIngredients } from "../../../hooks/useIngredient";
import {
  useAddJourneyIngredients,
  useAddJourneyPhaseProducts,
  useCreateJourneyPhase,
  useDeleteJourneyPhase,
  useJourneyById,
  useRemoveJourneyIngredient,
  useRemoveJourneyPhaseProduct,
  useUpdateJourneyPhase,
} from "../../../hooks/useJourney";

const JourneyManagePage: React.FC = () => {
  const { journeyId = "" } = useParams();
  const { data: journey, isLoading } = useJourneyById(journeyId);
  const createPhase = useCreateJourneyPhase();
  const updatePhase = useUpdateJourneyPhase();
  const deletePhase = useDeleteJourneyPhase();
  const addPhaseProducts = useAddJourneyPhaseProducts();
  const removePhaseProduct = useRemoveJourneyPhaseProduct();
  const addIngredients = useAddJourneyIngredients();
  const removeIngredient = useRemoveJourneyIngredient();
  const [form] = Form.useForm<Partial<JourneyPhase>>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JourneyPhase | null>(null);
  const [eanByPhase, setEanByPhase] = useState<Record<number, string>>({});
  const [ingredientSearch, setIngredientSearch] = useState("");
  const { data: ingredientOptions } = useSearchIngredients(ingredientSearch);

  useEffect(() => {
    if (editing) form.setFieldsValue(editing);
    else form.resetFields();
  }, [editing, form, open]);

  const submitPhase = async (values: Partial<JourneyPhase>) => {
    try {
      if (editing) {
        await updatePhase.mutateAsync({ id: editing.id, data: values });
        message.success("Phase mise à jour");
      } else {
        await createPhase.mutateAsync({ journeyId, data: values });
        message.success("Phase créée");
      }
      setOpen(false);
      setEditing(null);
    } catch {
      message.error("Erreur lors de l'enregistrement");
    }
  };

  const addProductToPhase = async (phaseId: number) => {
    const ean = (eanByPhase[phaseId] ?? "").trim();
    if (!ean) {
      message.error("EAN obligatoire");
      return;
    }
    try {
      await addPhaseProducts.mutateAsync({ id: phaseId, data: { ean } });
      setEanByPhase((prev) => ({ ...prev, [phaseId]: "" }));
      message.success("Produit ajouté");
    } catch {
      message.error("Produit introuvable ou erreur d'ajout");
    }
  };

  const addIngredient = async (ingredientId: number) => {
    await addIngredients.mutateAsync({ journeyId, data: { ingredientId } });
    setIngredientSearch("");
    message.success("Ingrédient ajouté");
  };

  const productColumns = (phaseId: number): ColumnsType<Product> => [
    { title: "UID", dataIndex: "uid", key: "uid" },
    { title: "Nom", dataIndex: "name", key: "name" },
    { title: "EAN", dataIndex: "ean", key: "ean" },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Product) => (
        <Popconfirm
          title="Retirer ce produit ?"
          onConfirm={async () => {
            await removePhaseProduct.mutateAsync({ id: phaseId, productId: record.uid });
            message.success("Produit retiré");
          }}
        >
          <Button danger>Retirer</Button>
        </Popconfirm>
      ),
    },
  ];

  const phaseColumns: ColumnsType<JourneyPhase> = [
    { title: "Ordre", dataIndex: "sortOrder", key: "sortOrder" },
    { title: "Nom", dataIndex: "name", key: "name" },
    {
      title: "Produits",
      key: "products",
      render: (_: unknown, record: JourneyPhase) => (
        <div>
          <Space.Compact style={{ width: "100%", marginBottom: 12 }}>
            <Input
              value={eanByPhase[record.id] ?? ""}
              placeholder="EAN du produit"
              onChange={(event) =>
                setEanByPhase((prev) => ({ ...prev, [record.id]: event.target.value }))
              }
              onPressEnter={() => addProductToPhase(record.id)}
            />
            <Button onClick={() => addProductToPhase(record.id)}>Ajouter</Button>
          </Space.Compact>
          <Table
            size="small"
            columns={productColumns(record.id)}
            dataSource={record.products ?? []}
            rowKey="uid"
            pagination={false}
          />
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: JourneyPhase) => (
        <Space>
          <Button
            onClick={() => {
              setEditing(record);
              setOpen(true);
            }}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Supprimer cette phase ?"
            onConfirm={async () => {
              await deletePhase.mutateAsync(record.id);
              message.success("Phase supprimée");
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
      <h2>{journey?.title ?? "Journey"}</h2>
      <Space style={{ marginBottom: 16 }} wrap>
        {(journey?.ingredients ?? []).map((ingredient: Ingredient) => (
          <Tag
            key={ingredient.id}
            closable
            onClose={async () => {
              await removeIngredient.mutateAsync({ journeyId, ingredientId: ingredient.id });
              message.success("Ingrédient retiré");
            }}
          >
            {ingredient.name}
          </Tag>
        ))}
      </Space>
      <Select
        showSearch
        style={{ width: "100%", marginBottom: 24 }}
        placeholder="Rechercher et ajouter un ingrédient"
        filterOption={false}
        value={undefined}
        onSearch={setIngredientSearch}
        onSelect={(value) => addIngredient(Number(value))}
        options={(ingredientOptions ?? []).map((ingredient) => ({
          value: ingredient.id,
          label: `${ingredient.name} (${ingredient.officialName})`,
        }))}
      />

      <Button type="primary" onClick={() => setOpen(true)} style={{ marginBottom: 16, float: "right" }}>
        Créer une phase
      </Button>
      <Table
        columns={phaseColumns}
        dataSource={journey?.phases ?? []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
      />
      <Modal
        title={editing ? "Modifier la phase" : "Créer une phase"}
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
        <Form form={form} layout="vertical" onFinish={submitPhase}>
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: "Nom obligatoire" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="htmlText"
            label="HTML"
            rules={[
              {
                validator: (_, value) => {
                  const text = String(value ?? "")
                    .replace(/<(.|\n)*?>/g, "")
                    .replace(/&nbsp;/g, "")
                    .trim();

                  if (text) return Promise.resolve();
                  return Promise.reject(new Error("Texte obligatoire"));
                },
              },
            ]}
          >
            <ReactQuill theme="snow" style={{ height: 220, marginBottom: 48 }} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Ordre">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default JourneyManagePage;
