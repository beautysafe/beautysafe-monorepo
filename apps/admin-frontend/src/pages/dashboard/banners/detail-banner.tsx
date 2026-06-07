import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Modal, message, Spin, Empty, Image, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQueryClient } from "@tanstack/react-query";

import { useBannerById, useDeleteBanner } from "../../../hooks/useBanner";
import EditBannerForm from "./edit-banner";
import type { Product } from "../../../lib/entities";

const cleanUrl = (value?: string | null): string | undefined => {
  const url = value?.trim();
  return url ? url : undefined;
};

const normalizeHtml = (html?: string | null): string => {
  if (!html) return "";

  return html
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/<p>\s*<\/p>/gi, "");
};

const getProductImageUrl = (product: Product): string | undefined => {
  const firstImage = product.images?.[0];

  return cleanUrl(firstImage?.thumbnail) || cleanUrl(firstImage?.image);
};

const DetailBanner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editVisible, setEditVisible] = useState(false);

  const { data: banner, isLoading } = useBannerById(id as string);
  const deleteBanner = useDeleteBanner();

  const handleDelete = () => {
    Modal.confirm({
      title: "Supprimer cette bannière ?",
      content:
        "Êtes-vous sûr de vouloir supprimer cette bannière ? Cette action est irréversible.",
      okText: "Oui, supprimer",
      okType: "danger",
      cancelText: "Annuler",
      onOk() {
        const hide = message.loading("Suppression en cours...", 0);

        return deleteBanner
          .mutateAsync(id as string)
          .then(() => {
            hide();
            message.success("Bannière supprimée avec succès !");
            navigate("/dashboard/banners");
          })
          .catch(() => {
            hide();
            message.error("Erreur lors de la suppression de la bannière");
          });
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <Spin />
      </div>
    );
  }

  if (!banner) {
    return <Empty description="Bannière non trouvée" />;
  }

  const products: Product[] = Array.isArray(banner.products)
    ? banner.products
    : [];

  const bannerImage = cleanUrl(banner.image);

  const productColumns: ColumnsType<Product> = [
    {
      title: "Image",
      key: "image",
      width: 120,
      render: (_, record) => {
        const imageUrl = getProductImageUrl(record);

        return imageUrl ? (
          <Image
            src={imageUrl}
            alt={record.name}
            width={80}
            height={80}
            style={{
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
            }}
            preview={{ mask: "Voir" }}
          />
        ) : (
          <span style={{ color: "#bbb" }}>—</span>
        );
      },
    },
    {
      title: "Nom du produit",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (value: string) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {value}
        </span>
      ),
    },
    {
      title: "EAN",
      dataIndex: "ean",
      key: "ean",
      width: 160,
    },
    {
      title: "Marque",
      dataIndex: ["brand", "name"],
      key: "brand",
      width: 160,
      render: (value?: string) => value || "—",
    },
    {
      title: "Score",
      dataIndex: "validScore",
      key: "validScore",
      width: 120,
      render: (value?: number) => value ?? "—",
    },
  ];

  return (
    <>
      <style>
        {`
          .detail-banner-page {
            max-width: 100%;
            overflow: hidden;
          }

          .detail-banner-card,
          .detail-banner-card .ant-card-body {
            max-width: 100%;
            overflow: hidden;
          }

          .banner-top-grid {
            display: grid;
            grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
            gap: 24px;
            align-items: start;
            margin-bottom: 24px;
          }

          .html-content,
          .html-content * {
            max-width: 100%;
            white-space: normal !important;
            overflow-wrap: break-word;
            word-break: normal;
            box-sizing: border-box;
          }

          .html-content {
            width: 100%;
            overflow-x: hidden;
          }

          .html-content p {
            margin: 0 0 12px;
          }

          .html-content h1,
          .html-content h2,
          .html-content h3 {
            margin: 0 0 16px;
            line-height: 1.35;
          }

          .html-content ul,
          .html-content ol {
            padding-left: 24px;
            margin-top: 8px;
            margin-bottom: 16px;
          }

          .html-content a {
            overflow-wrap: anywhere;
          }

          @media (max-width: 900px) {
            .banner-top-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="detail-banner-page">
        <Card
          className="detail-banner-card"
          title={banner.title}
          bodyStyle={{ maxWidth: "100%", overflow: "hidden" }}
          extra={
            <>
              <Button
                onClick={() => setEditVisible(true)}
                type="primary"
                style={{ marginRight: 8 }}
              >
                Modifier
              </Button>
              <Button danger onClick={handleDelete} loading={deleteBanner.isPending}>
                Supprimer
              </Button>
            </>
          }
        >
          <div className="banner-top-grid">
            <Card type="inner" title="Image de la bannière">
              {bannerImage ? (
                <Image
                  src={bannerImage}
                  alt={banner.title}
                  width="100%"
                  style={{
                    maxHeight: 280,
                    objectFit: "contain",
                    borderRadius: 8,
                    border: "1px solid #f0f0f0",
                  }}
                  preview={{ mask: "Voir" }}
                />
              ) : (
                <Empty description="Pas d'image" />
              )}
            </Card>

            <Card type="inner" title="Description courte">
              {banner.shortDescription ? (
                <div
                  className="html-content"
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: 8,
                    maxHeight: 280,
                    overflowY: "auto",
                    lineHeight: 1.6,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: normalizeHtml(banner.shortDescription),
                  }}
                />
              ) : (
                <Empty description="Pas de description courte" />
              )}
            </Card>
          </div>

          <Card
            type="inner"
            title="Produits liés"
            style={{ marginBottom: 24 }}
            bodyStyle={{ maxWidth: "100%", overflow: "hidden" }}
          >
            {products.length > 0 ? (
              <Table
                columns={productColumns}
                dataSource={products}
                rowKey={(record) => String(record.uid || record.ean)}
                pagination={false}
                scroll={{ x: 760 }}
              />
            ) : (
              <Empty description="Aucun produit lié" />
            )}
          </Card>

          <Card
            type="inner"
            title="Description longue"
            bodyStyle={{ maxWidth: "100%", overflow: "hidden" }}
          >
            {banner.longDescriptionHtml ? (
              <div
                className="html-content"
                style={{
                  padding: 16,
                  backgroundColor: "#fafafa",
                  borderRadius: 8,
                  lineHeight: 1.6,
                }}
                dangerouslySetInnerHTML={{
                  __html: normalizeHtml(banner.longDescriptionHtml),
                }}
              />
            ) : (
              <Empty description="Pas de description longue" />
            )}
          </Card>
        </Card>

        <Modal
          open={editVisible}
          title="Modifier la bannière"
          onCancel={() => setEditVisible(false)}
          footer={null}
          destroyOnClose
          width={900}
        >
          {banner && (
            <EditBannerForm
              bannerId={id as string}
              initialValues={banner}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["banner", id] });
                message.success("Bannière mise à jour avec succès !");
                setEditVisible(false);
              }}
            />
          )}
        </Modal>
      </div>
    </>
  );
};

export default DetailBanner;