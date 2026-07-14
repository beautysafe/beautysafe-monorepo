import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Modal, message, Descriptions } from "antd";
import {
  useProductById,
  useDeleteProduct,
  useUpdateProduct,
} from "../../../hooks/useProduct";
import EditProductForm from "./edit-product";
import { useQueryClient } from "@tanstack/react-query";
import type { Ingredient } from "../../../lib/entities";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: product, isLoading } = useProductById(id as string);
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const [editVisible, setEditVisible] = useState(false);

  const handleDelete = () => {
    Modal.confirm({
      title: "Supprimer le produit ?",
      content: "Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.",
      okText: "Oui, supprimer",
      okType: "danger",
      cancelText: "Annuler",
      onOk() {
        const hide = message.loading("Suppression en cours...", 0);
        return deleteProduct
          .mutateAsync(id as string)
          .then(() => {
            hide();
            message.success("Produit supprimé avec succès !");
            navigate("/dashboard/products");
          })
          .catch(() => {
            hide();
            message.error("Erreur lors de la suppression du produit");
          });
      },
    });
  };

  const handleUpdate = async (values: any) => {
    if (!id) {
      message.error("Product ID is missing");
      return;
    }
    await updateProduct.mutateAsync({ id, data: values });
    queryClient.invalidateQueries({ queryKey: ["product", id] });

    message.success("Product updated");
  };

  if (isLoading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  // ----> Main UI
  return (
    <Card
      title={product.name}
      extra={
        <>
          <Button onClick={() => setEditVisible(true)} type="primary" style={{ marginRight: 8 }}>
            Modifier
          </Button>
          <Button danger onClick={handleDelete}>
            Supprimer
          </Button>
        </>
      }
    >
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 32,
      }}>
        <div style={{ flex: 1 }}>
          <Descriptions column={1}>
            <Descriptions.Item label="EAN">{product.ean}</Descriptions.Item>
            <Descriptions.Item label="Marque">{product.brand?.name}</Descriptions.Item>
            <Descriptions.Item label="Score">{product.validScore}</Descriptions.Item>
            <Descriptions.Item label="Type">{product.type}</Descriptions.Item>
            <Descriptions.Item label="Catégorie">{product.category?.name ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Sous-catégorie">{product.subCategory?.name ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Sous-sous-catégorie">{product.subSubCategory?.name ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Flags">
              {(product.flags && product.flags.length > 0)
                ? product.flags.map((f: { name: any; }) => f.name).join(', ')
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Ingrédients">
              {(product.composition && product.composition.length > 0)
                ? (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {product.composition.map((ing: Ingredient) =>
                      <li key={ing.id}>
                      {ing.officialName || ing.name}
                      <span style={{ color: "#888", marginLeft: 8 }}>
                        (Score: {ing.score})
                      </span>
                      </li>
                    )}
                    </ul>
                ) : "—"}
            </Descriptions.Item>
          </Descriptions>
        </div>
        {/* --- IMAGES --- */}
        <div>
          {Array.isArray(product.images) && product.images.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {product.images.map((img: { image: string | undefined; id: React.Key | null | undefined; thumbnail: any; }) => (
                <a
                  href={img.image}
                  key={img.id}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Cliquez pour voir l'image en taille réelle"
                >
                  <img
                    src={img.thumbnail || img.image}
                    alt={product.name}
                    style={{
                      maxWidth: 220,
                      maxHeight: 220,
                      borderRadius: 6,
                      boxShadow: "0 2px 8px #eee",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      marginBottom: 6,
                    }}
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <Modal
        open={editVisible}
        title="Update Product"
        onCancel={() => setEditVisible(false)}
        footer={null}
        destroyOnClose
      >
        <EditProductForm
          initialValues={product}
          onFinish={handleUpdate}
          onSaved={() => setEditVisible(false)}
          loading={updateProduct.isPending}
        />
      </Modal>
    </Card>
  );
};

export default ProductDetail;
