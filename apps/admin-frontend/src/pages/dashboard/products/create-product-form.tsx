import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Divider,
  Select,
  Tag,
  Space,
  message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useCreateProduct } from "../../../hooks/useProduct";
import { useSearchBrands } from "../../../hooks/useBrand";
import { useSearchIngredients } from "../../../hooks/useIngredient";
import { useFlags } from "../../../hooks/useFlag";

const flagNamesFr: Record<string, string> = {
  BEST_PRODUCT: "Meilleur produit",
  TREND: "Tendance",
  SPONSORED: "Sponsorisé",

  HAIR: "Cheveux",
  "DRY-HAIR": "Cheveux secs",
  "DAMAGED-HAIR": "Cheveux abîmés",
  "COLORED-HAIR": "Cheveux colorés",
  "CURLY-COILY-HAIR": "Cheveux bouclés / frisés",
  "FINE-HAIR": "Cheveux fins",
  "OILY-HAIR": "Cheveux gras",
  "HAIR-LOSS": "Chute de cheveux",
  "DANDRUFF-HAIR": "Pellicules",

  SKIN: "Peau",
  "ACNE-SKIN": "Acné",
  "DARK-CIRCLES-SKIN": "Cernes",
  "ECZEMA-SKIN": "Eczéma",
  "OILY-SKIN": "Peau grasse",
  "BLACKHEADS-SKIN": "Points noirs",
  "PIGMENTATION-SPOTS-SKIN": "Taches pigmentaires",
  "ENLARGED-PORES": "Pores dilatés",
};

const getIngredientLabel = (ingredient: any) =>
  ingredient?.name?.trim() || ingredient?.officialName || "Ingrédient";

const CreateProductForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const createProduct = useCreateProduct();

  const [brandSearch, setBrandSearch] = React.useState("");
  const { data: brands = [], isLoading: brandsLoading } = useSearchBrands(brandSearch);

  const [ingredientSearch, setIngredientSearch] = React.useState("");
  const { data: searchedIngredients = [], isLoading: ingredientsLoading } =
    useSearchIngredients(ingredientSearch);

  const { data: flags = [] } = useFlags();

  const [selectedIngredients, setSelectedIngredients] = React.useState<any[]>([]);
  const [selectedSpecialFlagIds, setSelectedSpecialFlagIds] = React.useState<number[]>([]);
  const [selectedCategoryFlagIds, setSelectedCategoryFlagIds] = React.useState<number[]>([]);

  const specialFlagIds = [1, 2, 3];
  const hiddenRootFlagIds = [4, 13];
  const hairSubFlagIds = [5, 6, 7, 8, 9, 10, 11, 12];
  const skinSubFlagIds = [14, 15, 16, 17, 18, 19, 20];

  const ingredientOptions = searchedIngredients.map((ingredient: any) => ({
    label: getIngredientLabel(ingredient),
    value: ingredient.id,
    ingredient,
  }));

  const specialFlagOptions = flags
    .filter((f: any) => specialFlagIds.includes(f.id))
    .map((f: any) => ({
      label: flagNamesFr[f.name] || f.name,
      value: f.id,
    }));

  const categoryFlagOptions = flags
    .filter((f: any) => !specialFlagIds.includes(f.id) && !hiddenRootFlagIds.includes(f.id))
    .map((f: any) => ({
      label: flagNamesFr[f.name] || f.name,
      value: f.id,
    }));

  const handleIngredientSelectChange = (ids: number[]) => {
    const map = new Map(
      ingredientOptions.map((option: any) => [option.value, option.ingredient])
    );

    const next = ids.map((id) => map.get(id)).filter(Boolean);

    setSelectedIngredients(next);
    form.setFieldValue("compositionIds", ids);
  };

  const buildFinalFlagIds = () => {
    const result = new Set<number>([
      ...selectedSpecialFlagIds,
      ...selectedCategoryFlagIds,
    ]);

    if (selectedCategoryFlagIds.some((id) => hairSubFlagIds.includes(id))) {
      result.add(4);
    }

    if (selectedCategoryFlagIds.some((id) => skinSubFlagIds.includes(id))) {
      result.add(13);
    }

    return Array.from(result);
  };

  const onFinish = (values: any) => {
    const payload = {
      name: values.name,
      ean: values.ean,
      validScore: values.validScore,
      type: values.type,
      brandId: values.brandId,
      imageUrls: values.images?.map((img: any) => img.image) || [],
      thumbnailUrls:
        values.images?.map((img: any) => img.thumbnail || img.image) || [],
      compositionIds: values.compositionIds || [],
      flagIds: buildFinalFlagIds(),
    };

    createProduct.mutate(payload, {
      onSuccess: () => {
        message.success("Produit créé !");
        form.resetFields();
        onSuccess?.();
      },
      onError: () => message.error("Erreur lors de la création du produit"),
    });
  };

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="brandId" label="Marque" rules={[{ required: true }]}>
        <Select
          showSearch
          placeholder="Rechercher une marque"
          loading={brandsLoading}
          filterOption={false}
          onSearch={setBrandSearch}
        >
          {brands.map((b: any) => (
            <Select.Option key={b.id} value={b.id}>
              {b.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="ean" label="EAN" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="validScore" label="Score">
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="type" label="Type">
        <Input />
      </Form.Item>

      <Divider>Images</Divider>

      <Form.List name="images">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: "flex" }}>
                <Form.Item {...restField} name={[name, "image"]} rules={[{ required: true }]}>
                  <Input placeholder="URL image" />
                </Form.Item>

                <Form.Item {...restField} name={[name, "thumbnail"]}>
                  <Input placeholder="URL thumbnail" />
                </Form.Item>

                <Button
                  icon={<MinusCircleOutlined />}
                  onClick={() => remove(name)}
                />
              </Space>
            ))}

            <Button icon={<PlusOutlined />} onClick={() => add()} block>
              Ajouter une image
            </Button>
          </>
        )}
      </Form.List>

      <Divider>Ingrédients</Divider>

      <Form.Item name="compositionIds" hidden>
        <Input />
      </Form.Item>

      <Select
        mode="multiple"
        showSearch
        placeholder="Rechercher un ingrédient"
        filterOption={false}
        onSearch={setIngredientSearch}
        onChange={handleIngredientSelectChange}
        loading={ingredientsLoading}
        options={ingredientOptions}
        style={{ width: "100%" }}
      />

      <div style={{ marginTop: 10 }}>
        {selectedIngredients.map((ingredient: any) => (
          <Tag key={ingredient.id}>{getIngredientLabel(ingredient)}</Tag>
        ))}
      </div>

      <Divider>Mise en avant</Divider>

      <Select
        mode="multiple"
        placeholder="Flags spéciaux"
        value={selectedSpecialFlagIds}
        onChange={setSelectedSpecialFlagIds}
        options={specialFlagOptions}
        style={{ width: "100%" }}
      />

      <Divider>Catégories ciblées</Divider>

      <Select
        mode="multiple"
        placeholder="Flags catégories"
        value={selectedCategoryFlagIds}
        onChange={setSelectedCategoryFlagIds}
        options={categoryFlagOptions}
        style={{ width: "100%" }}
      />

      <Form.Item style={{ marginTop: 24 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={createProduct.isPending}
          block
        >
          Créer le produit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateProductForm;