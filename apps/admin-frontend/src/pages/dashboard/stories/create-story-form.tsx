import React from "react";
import { Form, Input, message } from "antd";
import { useCreateStory } from "../../../hooks/useStory";
import {
  ImageUploadField,
  type ImageUploadValue,
} from "../../../components/uploads/ImageUploadField";
import {
  VideoUploadField,
  type VideoUploadValue,
} from "../../../components/uploads/VideoUploadField";
import { deleteUploadedFile } from "../../../services/upload.service";

type StoryFormValues = {
  title: string;
};

const CreateStoryForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const createStory = useCreateStory();
  const [image, setImage] = React.useState<ImageUploadValue | null>(null);
  const [videos, setVideos] = React.useState<VideoUploadValue[]>([]);
  const [imageUploading, setImageUploading] = React.useState(false);
  const [videosUploading, setVideosUploading] = React.useState(false);
  const [uploadsCommitted, setUploadsCommitted] = React.useState(false);

  const onFinish = async (values: StoryFormValues) => {
    if (!image) {
      message.error("Image obligatoire");
      return;
    }
    if (imageUploading || videosUploading) {
      message.error("Attendez la fin des envois");
      return;
    }

    const payload = {
      title: values.title,
      image: image.url,
      imageKey: image.storagePath,
      videos: videos.map((video) => video.url),
      videoKeys: videos.map((video) => video.storagePath || ""),
    };

    try {
      await createStory.mutateAsync(payload);
      setUploadsCommitted(true);
      setImage(null);
      setVideos([]);
      message.success("Story créée !");
      form.resetFields();
      setTimeout(() => onSuccess?.(), 0);
    } catch {
      const paths = [
        image?.isNew ? image.storagePath : undefined,
        ...videos.filter((video) => video.isNew).map((video) => video.storagePath),
      ].filter((path): path is string => Boolean(path));
      await Promise.all(
        paths.map((path) => deleteUploadedFile(path).catch(() => undefined)),
      );
      setImage(null);
      setVideos([]);
      message.error("Erreur lors de la création de la story");
    }
  };

  return (
    <Form id="create-story-form" layout="vertical" form={form} onFinish={onFinish}>
      <Form.Item name="title" label="Titre" rules={[{ required: true, message: "Titre obligatoire" }]}>
        <Input />
      </Form.Item>

      <Form.Item>
        <ImageUploadField
          label="Image"
          folder="stories"
          value={image}
          onChange={setImage}
          onUploadingChange={setImageUploading}
          disabled={createStory.isPending}
          committed={uploadsCommitted}
          required
        />
      </Form.Item>

      <Form.Item>
        <VideoUploadField
          label="Vidéos"
          folder="story-videos"
          value={videos}
          onChange={setVideos}
          onUploadingChange={setVideosUploading}
          multiple
          disabled={createStory.isPending}
          committed={uploadsCommitted}
        />
      </Form.Item>
    </Form>
  );
};

export default CreateStoryForm;

