import React from "react";
import { Button, Form, Input, Space, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useCreateStory } from "../../../hooks/useStory";

type StoryFormValues = {
  title: string;
  image: string;
  videos?: Array<{ url?: string }>;
};

const CreateStoryForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const createStory = useCreateStory();

  const onFinish = async (values: StoryFormValues) => {
    const payload = {
      title: values.title,
      image: values.image,
      videos: (values.videos || []).map((v) => v?.url).filter(Boolean),
    };

    try {
      await createStory.mutateAsync(payload);
      message.success("Story créée !");
      form.resetFields();
      onSuccess?.();
    } catch {
      message.error("Erreur lors de la création de la story");
    }
  };

  return (
    <Form id="create-story-form" layout="vertical" form={form} onFinish={onFinish}>
      <Form.Item name="title" label="Titre" rules={[{ required: true, message: "Titre obligatoire" }]}>
        <Input />
      </Form.Item>

      <Form.Item name="image" label="Image (URL)" rules={[{ required: true, message: "Image obligatoire" }]}>
        <Input placeholder="https://..." />
      </Form.Item>

      <Form.List name="videos">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: "flex" }}>
                <Form.Item {...restField} name={[name, "url"]}>
                  <Input placeholder="URL vidéo (optionnel)" />
                </Form.Item>

                <Button icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
              </Space>
            ))}

            <Button icon={<PlusOutlined />} onClick={() => add()} block>
              Ajouter une vidéo
            </Button>
          </>
        )}
      </Form.List>
    </Form>
  );
};

export default CreateStoryForm;

