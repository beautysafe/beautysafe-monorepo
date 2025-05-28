import React from "react";
import { Form, Input, InputNumber, Button, Space, Divider } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { Product } from "../../../lib/entities/product.entity";

interface EditProductFormProps {
  initialValues: Partial<Product>;
  onFinish: (values: any) => void;
  loading: boolean;
}
interface ProductFormValues extends Partial<Product> {
  ingredients?: any[]; // for form editing, can be typed better if needed
}
const EditProductForm: React.FC<EditProductFormProps> = ({
  initialValues,
  onFinish,
  loading,
}) => {
  const [form] = Form.useForm();

React.useEffect(() => {
  // Extract the first compositions.ingredients if present
  let prefill: ProductFormValues = { ...initialValues };
  if (prefill.compositions && Array.isArray(prefill.compositions)) {
    prefill.ingredients = (prefill.compositions[0]?.ingredients || []);
  }
  form.setFieldsValue(prefill);
}, [initialValues, form]);

const handleFinish = (values: ProductFormValues) => {
  const { ingredients, ...rest } = values;
  const updated: Partial<Product> = {
    ...rest,
    compositions: [
      {
        index: 1,
        ingredients: ingredients || [],
      },
    ],
  };
  onFinish(updated);
};

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="brand" label="Marque" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="score" label="Score">
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="validation_score" label="Validation Score">
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>

      <Divider>Ingrédients</Divider>
      <Form.List name="ingredients">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, "official_name"]}
                  rules={[{ required: true, message: "Nom d'ingrédient requis" }]}
                >
                  <Input placeholder="Nom de l'ingrédient" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "score"]}
                  rules={[{ required: true, message: "Score requis" }]}
                >
                  <InputNumber placeholder="Score" />
                </Form.Item>
                <Button type="link" danger onClick={() => remove(name)} icon={<MinusCircleOutlined />} />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                icon={<PlusOutlined />}
                block
              >
                Ajouter un ingrédient
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item>
        <Button htmlType="submit" type="primary" loading={loading} block>
          Enregistrer
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditProductForm;
