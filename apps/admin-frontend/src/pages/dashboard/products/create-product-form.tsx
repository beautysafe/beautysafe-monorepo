import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Divider,
  Space,
  message,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useCreateProduct } from "../../../hooks/useProduct";
import { useFlags } from "../../../hooks/useFlag";
import { useCategories, useCategoryById } from "../../../hooks/useCategory";
import { useSubCategoryById } from "../../../hooks/useSubCategory";
import { useSubSubCategoryById } from "../../../hooks/useSubSubCategory";
import { useSearchBrands } from "../../../hooks/useBrand";
import { useSearchIngredients } from "../../../hooks/useIngredient";
import type { Category, SubSubCategory } from "../../../lib/entities";

const { Option } = Select;

interface CreateProductFormProps {
  onSuccess?: () => void; // <--- Accept onSuccess!
}

const CreateProductForm: React.FC<CreateProductFormProps> = ({}) => {
  const [form] = Form.useForm();
  const createProduct = useCreateProduct();

  // For dependent selects
  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<number>();

  // Brand search
  const [brandSearch, setBrandSearch] = useState("");
  const { data: brands = [], isLoading: brandsLoading } =
    useSearchBrands(brandSearch);

  // Ingredient search
  const [ingredientSearch, setIngredientSearch] = useState("");
  const { data: ingredients = [], isLoading: ingredientsLoading } =
    useSearchIngredients(ingredientSearch);

  // Category selects
  const { data: categories = [] } = useCategories();
  const { data: rawCategory } = useCategoryById(
    selectedCategory !== undefined ? selectedCategory : ""
  );
  const subCategories = rawCategory?.subcategories ?? [];
  const { data: rawSubCategory } = useSubCategoryById(
    selectedSubCategory !== undefined ? selectedSubCategory : ""
  );
  const subSubCategories = rawSubCategory?.subsubcategories ?? [];
  // Flags
  const { data: flags = [] } = useFlags();

  // Handle category change to reset subcategory and subsubcategory
  useEffect(() => {
    setSelectedSubCategory(undefined);
    form.setFieldsValue({
      subCategoryId: undefined,
      subSubCategoryId: undefined,
    });
  }, [selectedCategory, form]);

  // Handle submit
  const onFinish = (values: any) => {
    // Images: [{ image, thumbnail }] => separate arrays for API
    const imageUrls = (values.images || []).map((img: any) => img.image);
    const thumbnailUrls = (values.images || []).map(
      (img: any) => img.thumbnail || img.image
    );
    const payload = {
      ...values,
      imageUrls,
      thumbnailUrls,
    };
    createProduct.mutate(payload, {
      onSuccess: () => {
        message.success("Produit créé !");
        form.resetFields();
      },
      onError: () => message.error("Erreur lors de la création du produit"),
    });
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      initialValues={{ type: "Men", images: [], compositionIds: [] }}
    >
      <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      {/* Brand - autocomplete */}
      <Form.Item name="brandId" label="Marque" rules={[{ required: true }]}>
        <Select
          showSearch
          placeholder="Rechercher une marque"
          loading={brandsLoading}
          filterOption={false}
          onSearch={setBrandSearch}
        >
          {brands.map((brand: any) => (
            <Option key={brand.id} value={brand.id}>
              {brand.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="ean" label="EAN" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="validScore" label="Score">
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="type" label="Type" rules={[{ required: true }]}>
        <Select>
          <Option value="Men">Homme</Option>
          <Option value="Women">Femme</Option>
          <Option value="Child">Enfant</Option>
          <Option value="Baby">Bébé</Option>
        </Select>
      </Form.Item>
      {/* Cascading Category Selects */}
      <Form.Item
        name="categoryId"
        label="Catégorie"
        rules={[{ required: true }]}
      >
        <Select
          placeholder="Choisir une catégorie"
          onChange={(val) => setSelectedCategory(val)}
          allowClear
        >
          {categories.map((cat) => (
            <Option key={cat.id} value={cat.id}>
              {cat.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="subCategoryId" label="Sous-catégorie">
        <Select
          placeholder="Choisir une sous-catégorie"
          onChange={(val) => setSelectedSubCategory(val)}
          allowClear
        >
          {subCategories.map((sub: any) => (
            <Option key={sub.id} value={sub.id}>
              {sub.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="subSubCategoryId" label="Sous-sous-catégorie">
        <Select placeholder="Choisir une sous-sous-catégorie" allowClear>
          {subSubCategories.map((subsub: any) => (
            <Option key={subsub.id} value={subsub.id}>
              {subsub.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Ingredients multi-select autocomplete */}
      <Form.Item name="compositionIds" label="Ingrédients">
        <Select
          mode="multiple"
          showSearch
          placeholder="Rechercher un ingrédient"
          loading={ingredientsLoading}
          filterOption={false}
          onSearch={setIngredientSearch}
          optionFilterProp="children"
        >
          {ingredients.map((ing: any) => (
            <Option key={ing.id} value={ing.id}>
              {ing.officialName} {ing.name && `(${ing.name})`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Flags (optional) */}
      <Form.Item name="flagIds" label="Flags">
        <Select mode="multiple" placeholder="Sélectionner les flags">
          {flags.map((flag: any) => (
            <Option key={flag.id} value={flag.id}>
              {flag.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Images */}
      <Divider>Images</Divider>
      <Form.List name="images">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                style={{ display: "flex", marginBottom: 8 }}
                align="baseline"
              >
                <Form.Item
                  {...restField}
                  name={[name, "image"]}
                  rules={[
                    { required: true, message: "URL de l'image requise" },
                  ]}
                >
                  <Input placeholder="URL image" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "thumbnail"]}
                  rules={[{ required: false }]}
                >
                  <Input placeholder="URL thumbnail (optionnel)" />
                </Form.Item>
                <Button
                  type="link"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => remove(name)}
                />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                icon={<PlusOutlined />}
                block
              >
                Ajouter une image
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item>
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
