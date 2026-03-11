import React from "react";
import { Card, Row, Col, Typography, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useFlags } from "../../../hooks/useFlag";
import type { Flag } from "../../../lib/entities";

const { Title } = Typography;

const flagIcons: Record<string, string> = {
  HAIR: "💇",
  "DRY-HAIR": "🌵",
  "DAMAGED-HAIR": "🩹",
  "COLORED-HAIR": "🎨",
  "CURLY-COILY-HAIR": "〰️",
  "FINE-HAIR": "🪶",
  "OILY-HAIR": "💧",
  "HAIR-LOSS": "🍂",
  "DANDRUFF-HAIR": "❄️",

  SKIN: "✨",
  "ACNE-SKIN": "🔴",
  "DARK-CIRCLES-SKIN": "🌙",
  "ECZEMA-SKIN": "🩺",
  "OILY-SKIN": "💦",
  "BLACKHEADS-SKIN": "⚫",
  "PIGMENTATION-SPOTS-SKIN": "🟤",
  "ENLARGED-PORES": "🫧",
};
const flagNamesFr: Record<string, string> = {
  HAIR: "Cheveux",
  "DRY-HAIR": "Cheveux secs",
  "DAMAGED-HAIR": "Cheveux abîmés",
  "COLORED-HAIR": "Cheveux colorés",
  "CURLY-COILY-HAIR": "Cheveux bouclés / frisés",
  "FINE-HAIR": "Cheveux fins",
  "OILY-HAIR": "Cheveux gras",
  "HAIR-LOSS": "Chute de cheveux",
  "DANDRUFF-HAIR": "Pellicules",

  SKIN: "Peau",
  "ACNE-SKIN": "Acné",
  "DARK-CIRCLES-SKIN": "Cernes",
  "ECZEMA-SKIN": "Eczéma",
  "OILY-SKIN": "Peau grasse",
  "BLACKHEADS-SKIN": "Points noirs",
  "PIGMENTATION-SPOTS-SKIN": "Taches pigmentaires",
  "ENLARGED-PORES": "Pores dilatés",
};

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: flags, isLoading } = useFlags();

  if (isLoading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
    );
  }

  const filteredFlags: Flag[] = (flags ?? []).filter((flag: Flag) => flag.id >= 4);

  const hairMain = filteredFlags.find((flag) => flag.id === 4);
  const hairSubCategories = filteredFlags.filter(
    (flag) => flag.id >= 5 && flag.id <= 12
  );

  const skinMain = filteredFlags.find((flag) => flag.id === 13);
  const skinSubCategories = filteredFlags.filter(
    (flag) => flag.id >= 14 && flag.id <= 20
  );

  const renderSection = (mainCategory?: Flag, subCategories: Flag[] = []) => {
    if (!mainCategory) return null;

    return (
      <div style={{ marginBottom: "40px" }}>
        <Title level={3} style={{ marginBottom: "20px" }}>
          {flagIcons[mainCategory.name] || "🌟"} {flagNamesFr[mainCategory.name]}
        </Title>

        <Row gutter={[16, 16]}>
          {subCategories.map((flag) => (
            <Col key={flag.id} xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card
                hoverable
                style={{ textAlign: "center", borderRadius: "12px" }}
                onClick={() =>
                  navigate(`/dashboard/products?flagId=${flag.id}`)
                }
              >
                <div style={{ fontSize: "36px" }}>
                  {flagIcons[flag.name] || "🌟"}
                </div>
                <div style={{ marginTop: 8, fontWeight: 500 }}>
                  {flagNamesFr[flag.name]}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Categories
      </Title>

      {renderSection(hairMain, hairSubCategories)}
      {renderSection(skinMain, skinSubCategories)}
    </div>
  );
};

export default CategoriesPage;