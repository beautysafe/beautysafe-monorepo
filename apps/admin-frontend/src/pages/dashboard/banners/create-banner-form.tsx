import React from "react";
import { Form, Input, message } from "antd";
import { useCreateBanner } from "../../../hooks/useBanner";

type BannerFormValues = {
  title: string;
  image: string;
  description: string;
};

const CreateBannerForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const createBanner = useCreateBanner();

  const onFinish = async (values: BannerFormValues) => {
    try {
      await createBanner.mutateAsync(values);
      message.success("Bannière créée !");
      form.resetFields();
      onSuccess?.();
    } catch {
      message.error("Erreur lors de la création de la bannière");
    }
  };

  return (
    <Form id="create-banner-form" layout="vertical" form={form} onFinish={onFinish}>
      <Form.Item name="title" label="Titre" rules={[{ required: true, message: "Titre obligatoire" }]}>
        <Input />
      </Form.Item>

      <Form.Item name="image" label="Image (URL)" rules={[{ required: true, message: "Image obligatoire" }]}>
        <Input placeholder="https://..." />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Description obligatoire" }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>
    </Form>
  );
};

export default CreateBannerForm;

