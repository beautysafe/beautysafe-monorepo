import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Space, Tag } from "antd";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { useCreateBanner } from "../../../hooks/useBanner";
import { useProductByEan } from "../../../hooks/useProduct";
import type { CreateBannerPayload, Product } from "../../../lib/entities";

type BannerFormValues = {
  title: string;
  image: string;
};

const CreateBannerForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [form] = Form.useForm<BannerFormValues>();
  const createBanner = useCreateBanner();

  const [eanInput, setEanInput] = useState("");
  const [eanToSearch, setEanToSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const [shortDescription, setShortDescription] = useState("");
  const [longDescriptionHtml, setLongDescriptionHtml] = useState("");

  const { data: foundProduct, isFetching } = useProductByEan(eanToSearch);

  useEffect(() => {
    const formElement = document.getElementById("create-banner-form");

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

      await createBanner.mutateAsync(payload);

      message.success("Bannière créée !");
      form.resetFields();
      setShortDescription("");
      setLongDescriptionHtml("");
      setSelectedProducts([]);
      setEanInput("");
      setEanToSearch("");
      onSuccess?.();
    } catch {
      message.error("Erreur lors de la création de la bannière");
    }
  };

  return (
    <Form
      id="create-banner-form"
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
    </Form>
  );
};

export default CreateBannerForm;