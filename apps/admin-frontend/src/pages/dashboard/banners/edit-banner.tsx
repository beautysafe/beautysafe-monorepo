import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Space, Spin, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";

import { useBannerById, useUpdateBanner } from "../../../hooks/useBanner";
import BannerForm from "./banner-form";

export default function EditBannerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bannerQuery = useBannerById(id ?? "");
  const updateBanner = useUpdateBanner();
  const returnToList = () => navigate("/dashboard/banners");

  if (bannerQuery.isLoading) {
    return <Spin />;
  }

  if (bannerQuery.isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Impossible de charger la bannière"
      />
    );
  }

  if (!bannerQuery.data || !id) {
    return <Empty description="Bannière non trouvée" />;
  }

  return (
    <div>
      <Space align="center" style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={returnToList}
          aria-label="Retour aux bannières"
        />
        <Typography.Title level={2} style={{ margin: 0 }}>
          Modifier la bannière
        </Typography.Title>
      </Space>

      <BannerForm
        key={bannerQuery.data.id}
        mode="edit"
        initialBanner={bannerQuery.data}
        submitting={updateBanner.isPending}
        onSubmit={(payload) =>
          updateBanner.mutateAsync({ id, data: payload }).then(() => undefined)
        }
        onSuccess={returnToList}
        onCancel={returnToList}
      />
    </div>
  );
}
