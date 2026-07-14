import { CloseOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  message,
  Space,
  Switch,
  Typography,
} from "antd";
import { useState } from "react";
import { isAxiosError } from "axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
  ImageUploadField,
  type ImageUploadValue,
} from "../../../components/uploads/ImageUploadField";
import type {
  Banner,
  CreateBannerPayload,
  Product,
  UpdateBannerPayload,
} from "../../../lib/entities";
import { getProductByEan } from "../../../services/product.service";
import { deleteUploadedFile } from "../../../services/upload.service";

type BannerFormValues = {
  title: string;
  published: boolean;
};

type BannerFormProps =
  | {
      mode: "create";
      submitting: boolean;
      onSubmit: (payload: CreateBannerPayload) => Promise<void>;
      onSuccess: () => void;
      onCancel: () => void;
    }
  | {
      mode: "edit";
      initialBanner: Banner;
      submitting: boolean;
      onSubmit: (payload: UpdateBannerPayload) => Promise<void>;
      onSuccess: () => void;
      onCancel: () => void;
    };

const hasRichText = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim().length > 0;

const productImage = (product: Product) =>
  product.images?.[0]?.thumbnail || product.images?.[0]?.image;

const apiErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError<{ message?: string | string[] }>(error)) return fallback;
  const apiMessage = error.response?.data?.message;
  return Array.isArray(apiMessage)
    ? apiMessage.join(", ")
    : apiMessage || fallback;
};

export default function BannerForm(props: BannerFormProps) {
  const initialBanner = props.mode === "edit" ? props.initialBanner : undefined;
  const [form] = Form.useForm<BannerFormValues>();
  const initialImage: ImageUploadValue | null = initialBanner
    ? {
        url: initialBanner.image,
        storagePath: initialBanner.imageKey ?? undefined,
        isNew: false,
      }
    : null;
  const [image, setImage] = useState<ImageUploadValue | null>(initialImage);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadCommitted, setUploadCommitted] = useState(false);
  const [shortDescription, setShortDescription] = useState(
    initialBanner?.shortDescription ?? "",
  );
  const [longDescriptionHtml, setLongDescriptionHtml] = useState(
    initialBanner?.longDescriptionHtml ?? "",
  );
  const [eanInput, setEanInput] = useState("");
  const [eanLoading, setEanLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(
    initialBanner?.products ?? [],
  );

  const addProductByEan = async () => {
    const ean = eanInput.trim();
    if (!ean || eanLoading) return;

    setEanLoading(true);
    try {
      const product = await getProductByEan(ean);
      if (selectedProducts.some((selected) => selected.uid === product.uid)) {
        message.warning("Ce produit est déjà ajouté");
        return;
      }
      setSelectedProducts((current) => [...current, product]);
      setEanInput("");
      message.success("Produit ajouté");
    } catch {
      message.error(`Aucun produit trouvé pour l’EAN ${ean}`);
    } finally {
      setEanLoading(false);
    }
  };

  const cleanupFailedImage = async () => {
    if (image?.isNew && image.storagePath) {
      await deleteUploadedFile(image.storagePath).catch(() => undefined);
      setImage(initialImage);
    }
  };

  const submit = async (values: BannerFormValues) => {
    if (!image) {
      message.error("Image obligatoire");
      return;
    }
    if (imageUploading) {
      message.error("Attendez la fin de l’envoi de l’image");
      return;
    }
    if (!hasRichText(longDescriptionHtml)) {
      message.error("Description longue obligatoire");
      return;
    }

    const common = {
      title: values.title.trim(),
      shortDescription: hasRichText(shortDescription) ? shortDescription : "",
      longDescriptionHtml,
      published: Boolean(values.published),
      productIds: selectedProducts.map((product) => product.uid),
    };

    try {
      if (props.mode === "create") {
        await props.onSubmit({
          ...common,
          image: image.url,
          imageKey: image.storagePath,
        });
      } else {
        await props.onSubmit({
          ...common,
          ...(image.isNew
            ? { image: image.url, imageKey: image.storagePath }
            : {}),
        });
      }

      setUploadCommitted(true);
      message.success(
        props.mode === "create"
          ? "Bannière créée avec succès"
          : "Bannière mise à jour avec succès",
      );
      window.setTimeout(props.onSuccess, 0);
    } catch (error) {
      await cleanupFailedImage();
      message.error(
        apiErrorMessage(
          error,
          props.mode === "create"
            ? "La création de la bannière a échoué"
            : "La mise à jour de la bannière a échoué",
        ),
      );
    }
  };

  const busy = props.submitting || imageUploading;

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
      <style>{`
        .banner-rich-editor .ql-container { min-height: 140px; }
        .banner-product-list { display: grid; gap: 12px; }
        .banner-product-card .ant-card-body {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
        }
        .banner-product-details { min-width: 0; flex: 1; }
      `}</style>
      <Form<BannerFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          title: initialBanner?.title ?? "",
          published: initialBanner?.published ?? false,
        }}
        onFinish={submit}
      >
        <Form.Item name="title" label="Titre">
          <Input disabled={busy} />
        </Form.Item>

        <Form.Item>
          <ImageUploadField
            label="Image"
            folder="banners"
            value={image}
            onChange={setImage}
            onUploadingChange={setImageUploading}
            disabled={props.submitting}
            committed={uploadCommitted}
            required
          />
        </Form.Item>

        <Form.Item label="Description courte">
          <ReactQuill
            className="banner-rich-editor"
            theme="snow"
            value={shortDescription}
            onChange={setShortDescription}
            readOnly={busy}
          />
        </Form.Item>

        <Form.Item label="Description longue" required>
          <ReactQuill
            className="banner-rich-editor"
            theme="snow"
            value={longDescriptionHtml}
            onChange={setLongDescriptionHtml}
            readOnly={busy}
          />
        </Form.Item>

        <Form.Item name="published" label="Publiée" valuePropName="checked">
          <Switch disabled={busy} aria-label="Publiée" />
        </Form.Item>

        <Form.Item label="Produits liés">
          <Space.Compact style={{ width: "100%" }}>
            <Input
              value={eanInput}
              placeholder="Saisir un EAN"
              disabled={busy}
              aria-label="EAN du produit à ajouter"
              onChange={(event) => setEanInput(event.target.value)}
              onPressEnter={(event) => {
                event.preventDefault();
                void addProductByEan();
              }}
            />
            <Button
              loading={eanLoading}
              disabled={busy}
              onClick={() => void addProductByEan()}
            >
              Ajouter
            </Button>
          </Space.Compact>

          <div className="banner-product-list" style={{ marginTop: 16 }}>
            {selectedProducts.map((product) => (
              <Card
                className="banner-product-card"
                key={product.uid}
                size="small"
              >
                <Avatar
                  shape="square"
                  size={56}
                  src={productImage(product)}
                  alt={product.name}
                >
                  {product.name?.slice(0, 1)}
                </Avatar>
                <div className="banner-product-details">
                  <Typography.Text strong ellipsis style={{ display: "block" }}>
                    {product.name}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    EAN : {product.ean}
                  </Typography.Text>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<CloseOutlined />}
                  disabled={busy}
                  aria-label={`Retirer ${product.name}`}
                  onClick={() =>
                    setSelectedProducts((current) =>
                      current.filter(
                        (selected) => selected.uid !== product.uid,
                      ),
                    )
                  }
                />
              </Card>
            ))}
          </div>
        </Form.Item>

        <Form.Item style={{ margin: "32px 0 0" }}>
          <Space wrap>
            <Button
              type="primary"
              htmlType="submit"
              loading={props.submitting}
              disabled={imageUploading}
            >
              Enregistrer
            </Button>
            <Button disabled={busy} onClick={props.onCancel}>
              Annuler
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
