import React from "react";
import { Alert, Typography } from "antd";
import IngredientsList from "./list-ingreddients";

const NewIngredientsList: React.FC = () => (
  <>
    <Typography.Title level={3}>Nouveaux ingrédients</Typography.Title>
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      message="Ces ingrédients ont été créés automatiquement depuis une liste collée dans un produit. Corrigez leur nom officiel et leur score, puis confirmez-les pour les publier."
    />
    <IngredientsList status="NEW" />
  </>
);

export default NewIngredientsList;
