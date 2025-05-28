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
      content:
        "Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.",
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
    setEditVisible(false);
  };
  if (isLoading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <Card
      title={product.name}
      extra={
        <>
          <Button
            onClick={() => setEditVisible(true)}
            type="primary"
            style={{ marginRight: 8 }}
          >
            Modifier
          </Button>
          <Button danger onClick={handleDelete}>
            Supprimer
          </Button>
        </>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 32, // space between descriptions and image
        }}
      >
        <div style={{ flex: 1 }}>
          <Descriptions column={1}>
            <Descriptions.Item label="EAN">
              {product.eans?.join(", ")}
            </Descriptions.Item>
            <Descriptions.Item label="Brand">{product.brand}</Descriptions.Item>
            <Descriptions.Item label="Score">{product.score}</Descriptions.Item>
            {/* <Descriptions.Item label="Validation Score">{product.validation_score}</Descriptions.Item> */}

            {/* --- Categories Section --- */}
            {/* <Descriptions.Item label="Catégories">
      {product.categories
        ? typeof product.categories === "object"
          ? Object.entries(product.categories)
              .map(([key, val]) => (
                <div key={key}>
                  <strong>{key.replace(/_/g, " ")}:</strong> {val}
                </div>
              ))
          : String(product.categories)
        : "N/A"}
    </Descriptions.Item> */}

            {/* --- Compositions Section --- */}
            <Descriptions.Item label="Ingrédients">
              {Array.isArray(product.compositions) &&
              product.compositions.length > 0
                ? product.compositions.map((comp, idx) => (
                    <div key={idx}>
                      {Array.isArray(comp.ingredients) ? (
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {comp.ingredients.map(
                            (
                              ing: {
                                official_name: any;
                                name: any;
                                score:
                                  | string
                                  | number
                                  | bigint
                                  | boolean
                                  | React.ReactElement<
                                      unknown,
                                      string | React.JSXElementConstructor<any>
                                    >
                                  | Iterable<React.ReactNode>
                                  | Promise<
                                      | string
                                      | number
                                      | bigint
                                      | boolean
                                      | React.ReactPortal
                                      | React.ReactElement<
                                          unknown,
                                          | string
                                          | React.JSXElementConstructor<any>
                                        >
                                      | Iterable<React.ReactNode>
                                      | null
                                      | undefined
                                    >
                                  | null
                                  | undefined;
                              },
                              i: React.Key | null | undefined
                            ) => (
                              <li key={i}>
                                {ing.official_name || ing.name}
                                {/* You can add more info here, e.g. */}
                                {ing.score !== undefined && (
                                  <span
                                    style={{ color: "#888", marginLeft: 8 }}
                                  >
                                    (Score: {ing.score})
                                  </span>
                                )}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </div>
                  ))
                : "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </div>
        <div>
          {product.images?.image && (
            <div style={{ marginTop: 16 }}>
              <a
                href={product.images.image}
                target="_blank"
                rel="noopener noreferrer"
                title="Cliquez pour voir l'image en taille réelle"
              >
                <img
                  src={product.images.image}
                  alt={product.name}
                  style={{
                    maxWidth: 400,
                    maxHeight: 400,
                    borderRadius: 6,
                    boxShadow: "0 2px 8px #eee",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* --- Image Section --- */}

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
          loading={updateProduct.isPending}
        />
      </Modal>
    </Card>
  );
};

export default ProductDetail;
