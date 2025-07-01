import React from "react";
import { Form, Input, InputNumber, Button, Space, Divider } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { Product} from "../../../lib/entities";
import FormItemLabel from "antd/es/form/FormItemLabel";

interface EditProductFormProps {
  initialValues: Partial<Product>;
  onFinish: (values: any) => void;
  loading: boolean;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  initialValues,
  onFinish,
  loading,
}) => {
  const [form] = Form.useForm();

  // Prepare initial values for form
  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        images: Array.isArray(initialValues.images)
          ? initialValues.images.map(img => ({ image: img.image, thumbnail: img.thumbnail }))
          : [],
        composition: Array.isArray(initialValues.composition)
          ? initialValues.composition.map(ing => ({
              officialName: ing.officialName,
              name: ing.name,
              score: ing.score,
            }))
          : [],
      });
    }
  }, [initialValues, form]);

  // Transform form values to API payload
  const handleFinish = (values: any) => {
    // Map images, composition, and other details as needed for API
    const payload: Partial<Product> = {
      ...values,
      images: values.images
        ? values.images.map((img: any) => ({
            image: img.image,
            thumbnail: img.thumbnail || img.image,
          }))
        : [],
      composition: values.composition
        ? values.composition.map((ing: any) => ({
            officialName: ing.officialName,
            name: ing.name,
            score: ing.score,
          }))
        : [],
    };
    onFinish(payload);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      initialValues={initialValues}
    >
      <Form.Item name="name" label="Nom" rules={[{ required: true, message: "Le nom est requis" }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name={["brand", "name"]}
        label="Marque"
        rules={[{ required: true, message: "La marque est requise" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="ean" label="EAN" rules={[{ required: true, message: "EAN requis" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="validScore" label="Score">
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="type" label="Type">
        <Input />
      </Form.Item>
      {/* You can add category, subCategory, subSubCategory here if you want (as Select fields) */}
      
      <Divider>Images</Divider>
      <Form.List name="images">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, "image"]}
                  rules={[{ required: true, message: "URL de l'image requise" }]}
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
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                Ajouter une image
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Divider>Ingrédients</Divider>
      <Form.List name="composition">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, "officialName"]}
                  rules={[{ required: true, message: "Nom officiel requis" }]}
                >
                  <Input placeholder="Nom officiel" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "name"]}
                  rules={[{ required: false }]}
                >
                  <Input placeholder="Nom (optionnel)" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "score"]}
                  rules={[{ required: false }]}
                >
                  <InputNumber placeholder="Score" style={{ width: "100%" }} />
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
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
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
