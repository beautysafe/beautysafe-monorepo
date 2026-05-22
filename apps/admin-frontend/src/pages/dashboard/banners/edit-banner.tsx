import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Space, Tag } from "antd";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { useUpdateBanner } from "../../../hooks/useBanner";
import { useProductByEan } from "../../../hooks/useProduct";
import type { Banner, CreateBannerPayload, Product } from "../../../lib/entities";

type BannerFormValues = {
  title: string;
  image: string;
};

interface EditBannerFormProps {
  bannerId: number | string;
  initialValues: Banner;
  onSuccess?: () => void;
  loading?: boolean;
}

const EditBannerForm: React.FC<EditBannerFormProps> = ({
  bannerId,
  initialValues,
  onSuccess,
  loading = false,
}) => {
  const [form] = Form.useForm<BannerFormValues>();
  const updateBanner = useUpdateBanner();

  const [eanInput, setEanInput] = useState("");
  const [eanToSearch, setEanToSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const [shortDescription, setShortDescription] = useState("");
  const [longDescriptionHtml, setLongDescriptionHtml] = useState("");

  const { data: foundProduct, isFetching } = useProductByEan(eanToSearch);

  useEffect(() => {
    form.setFieldsValue({
      title: initialValues.title,
      image: initialValues.image,
    });
    setShortDescription(initialValues.shortDescription || "");
    setLongDescriptionHtml(initialValues.longDescriptionHtml || "");
    setSelectedProducts(initialValues.products || []);
  }, [initialValues, form]);

  useEffect(() => {
    const formElement = document.getElementById("edit-banner-form");

    const handleSubmit = () => {
      form.submit();
    };

    formElement?.addEventListener("submit", handleSubmit);

    return () => {
      formElement?.removeEventListener("submit", handleSubmit);
    };
  }, [form]);

  useEffect(() => {
    if (!eanToSearch || !foundProduct) return;

    const alreadySelected = selectedProducts.some(
      (product) => product.uid === foundProduct.uid
    );

    if (alreadySelected) {
      message.warning("Ce produit est déjà ajouté");
      setEanInput("");
      setEanToSearch("");
      return;
    }

    setSelectedProducts((prev) => [...prev, foundProduct]);
    message.success("Produit ajouté");
    setEanInput("");
    setEanToSearch("");
  }, [foundProduct, eanToSearch]);

  const addProductByEan = () => {
    const cleanEan = eanInput.trim();

    if (!cleanEan) return;

    setEanToSearch(cleanEan);
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.filter((product) => product.uid !== productId)
    );
  };

  const onFinish = async (values: BannerFormValues) => {
    try {
      if (!shortDescription || shortDescription === "<p><br></p>") {
        message.error("Description courte obligatoire");
        return;
      }

      if (!longDescriptionHtml || longDescriptionHtml === "<p><br></p>") {
        message.error("Description longue obligatoire");
        return;
      }

      const payload: CreateBannerPayload = {
        ...values,
        shortDescription,
        longDescriptionHtml,
        productIds: selectedProducts.map((product) => product.uid),
      };

      await updateBanner.mutateAsync({ id: bannerId, data: payload });

      message.success("Bannière mise à jour !");
      onSuccess?.();
    } catch {
      message.error("Erreur lors de la mise à jour de la bannière");
    }
  };

  return (
    <Form
      id="edit-banner-form"
      layout="vertical"
      form={form}
      onFinish={onFinish}
    >
      <Form.Item
        name="title"
        label="Titre"
        rules={[{ required: true, message: "Titre obligatoire" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="image"
        label="Image URL"
        rules={[{ required: true, message: "Image obligatoire" }]}
      >
        <Input placeholder="https://..." />
      </Form.Item>

      <Form.Item label="Description courte">
        <ReactQuill
          theme="snow"
          value={shortDescription}
          onChange={setShortDescription}
          style={{ height: 160, marginBottom: 48 }}
        />
      </Form.Item>

      <Form.Item label="Description longue">
        <ReactQuill
          theme="snow"
          value={longDescriptionHtml}
          onChange={setLongDescriptionHtml}
          style={{ height: 260, marginBottom: 48 }}
        />
      </Form.Item>

      <Form.Item label="Produits liés par EAN">
        <Space.Compact style={{ width: "100%" }}>
          <Input
            value={eanInput}
            placeholder="Entrer EAN puis Enter"
            onChange={(e) => setEanInput(e.target.value)}
            onPressEnter={(e) => {
              e.preventDefault();
              addProductByEan();
            }}
          />
          <Button loading={isFetching} onClick={addProductByEan}>
            Ajouter
          </Button>
        </Space.Compact>

        <div style={{ marginTop: 12 }}>
          {selectedProducts.map((product) => (
            <Tag
              key={product.uid}
              closable
              onClose={() => removeProduct(product.uid)}
              style={{ marginBottom: 8 }}
            >
              {product.name} — {product.ean}
            </Tag>
          ))}
        </div>
      </Form.Item>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={loading || updateBanner.isPending}>
          Mettre à jour
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditBannerForm;
