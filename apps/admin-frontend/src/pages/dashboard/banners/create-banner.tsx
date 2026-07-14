import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";

import { useCreateBanner } from "../../../hooks/useBanner";
import BannerForm from "./banner-form";

export default function CreateBannerPage() {
  const navigate = useNavigate();
  const createBanner = useCreateBanner();
  const returnToList = () => navigate("/dashboard/banners");

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
          Créer une bannière
        </Typography.Title>
      </Space>

      <BannerForm
        mode="create"
        submitting={createBanner.isPending}
        onSubmit={(payload) =>
          createBanner.mutateAsync(payload).then(() => undefined)
        }
        onSuccess={returnToList}
        onCancel={returnToList}
      />
    </div>
  );
}
