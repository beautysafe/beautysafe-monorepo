import React from "react";
import { Button, Input, Space, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useResolveIngredients } from "../hooks/useIngredient";
import type { Ingredient } from "../lib/entities";
import { parseIngredientNames } from "./ingredient-bulk";

type Props = {
  onResolved: (ingredients: Ingredient[]) => void;
  disabled?: boolean;
};

const IngredientBulkInput: React.FC<Props> = ({ onResolved, disabled }) => {
  const [value, setValue] = React.useState("");
  const resolveIngredients = useResolveIngredients();

  const resolve = async (rawValue: string) => {
    const names = parseIngredientNames(rawValue);
    if (!names.length) {
      message.warning("Saisissez au moins un ingrédient");
      return;
    }

    try {
      const result = await resolveIngredients.mutateAsync(names);
      onResolved(result.ingredients);
      message.success(
        `${result.existingCount} ingrédient(s) existant(s), ${result.newCount} nouveau(x) ingrédient(s)`,
      );
      if (result.ambiguous.length) {
        message.warning(
          `Correspondance ambiguë : ${result.ambiguous
            .map(
              (entry) =>
                `${entry.input} (${entry.matches
                  .map(
                    (match) =>
                      `#${match.id} ${match.officialName || match.name}`,
                  )
                  .join(" / ")})`,
            )
            .join(", ")}. Aucun choix automatique n’a été effectué.`,
        );
      } else {
        setValue("");
      }
    } catch {
      message.error("Impossible de résoudre les ingrédients");
    }
  };

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Input.TextArea
        value={value}
        autoSize={{ minRows: 1, maxRows: 4 }}
        disabled={disabled || resolveIngredients.isPending}
        placeholder="Collez une liste séparée par des virgules ou des backslashes"
        onChange={(event) => setValue(event.target.value)}
        onPaste={(event) => {
          const pasted = event.clipboardData.getData("text");
          if (/[\\,]/.test(pasted)) {
            event.preventDefault();
            void resolve(pasted);
          }
        }}
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        loading={resolveIngredients.isPending}
        disabled={disabled}
        onClick={() => void resolve(value)}
      >
        Ajouter
      </Button>
    </Space.Compact>
  );
};

export default IngredientBulkInput;
