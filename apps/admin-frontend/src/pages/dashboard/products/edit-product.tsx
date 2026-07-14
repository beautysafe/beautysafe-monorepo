import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Divider,
  Select,
  Tag,
  message,
} from "antd";
import type { Product } from "../../../lib/entities";
import { useSearchIngredients } from "../../../hooks/useIngredient";
import { useFlags } from "../../../hooks/useFlag";
import { useSearchBrands } from "../../../hooks/useBrand";
import {
  MultipleProductImageUpload,
  type ProductImageUploadValue,
} from "../../../components/uploads/MultipleProductImageUpload";
import { deleteUploadedFile } from "../../../services/upload.service";
interface EditProductFormProps {
  initialValues: Partial<Product>;
  onFinish: (values: any) => Promise<void>;
  onSaved?: () => void;
  loading: boolean;
}

const flagNamesFr: Record<string, string> = {
  BEST_PRODUCT: "Meilleur produit",
  TREND: "Tendance",
  SPONSORED: "Sponsorisé",

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

const getIngredientLabel = (ingredient: any) => {
  return ingredient?.name?.trim() || ingredient?.officialName || "Ingrédient";
};

const EditProductForm: React.FC<EditProductFormProps> = ({
  initialValues,
  onFinish,
  onSaved,
  loading,
}) => {
  const [form] = Form.useForm();
  const [images, setImages] = React.useState<ProductImageUploadValue[]>([]);
  const [imagesUploading, setImagesUploading] = React.useState(false);
  const [uploadsCommitted, setUploadsCommitted] = React.useState(false);
  const [brandSearch, setBrandSearch] = React.useState("");
  const { data: searchedBrands, isLoading: isSearchingBrands } =
    useSearchBrands(brandSearch);

  const [selectedBrandId, setSelectedBrandId] = React.useState<number | undefined>(
    undefined
  );

  const initialBrand = (initialValues as any)?.brand;

  const searchedBrandOptions = Array.isArray(searchedBrands)
    ? searchedBrands.map((brand: any) => ({
        label: brand.name,
        value: brand.id,
        brand,
      }))
    : [];

  const brandOptions = [
    ...(initialBrand
      ? [
          {
            label: initialBrand.name,
            value: initialBrand.id,
            brand: initialBrand,
          },
        ]
      : []),
    ...searchedBrandOptions.filter(
      (option: any) => option.value !== initialBrand?.id
    ),
  ];

  const handleBrandChange = (brandId: number) => {
    setSelectedBrandId(brandId);
    form.setFieldValue("brandId", brandId);
  };
  const [ingredientSearch, setIngredientSearch] = React.useState("");
  const { data: searchedIngredients, isLoading: isSearchingIngredients } =
    useSearchIngredients(ingredientSearch);

  const { data: flags = [], isLoading: isLoadingFlags } = useFlags();

  const [selectedIngredients, setSelectedIngredients] = React.useState<any[]>([]);
  const [selectedSpecialFlagIds, setSelectedSpecialFlagIds] = React.useState<number[]>([]);
  const [selectedCategoryFlagIds, setSelectedCategoryFlagIds] = React.useState<number[]>([]);

  const specialFlagIds = [1, 2, 3];
  const hiddenRootFlagIds = [4, 13];
  const hairSubFlagIds = [5, 6, 7, 8, 9, 10, 11, 12];
  const skinSubFlagIds = [14, 15, 16, 17, 18, 19, 20];

  React.useEffect(() => {
    if (!initialValues) return;

    const initialIngredientObjects = Array.isArray(initialValues.composition)
      ? initialValues.composition
      : [];

    const initialFlagObjects = Array.isArray((initialValues as any).flags)
      ? (initialValues as any).flags
      : [];

    const initialIds = initialFlagObjects.map((flag: any) => flag.id);

    const initialSpecial = initialIds.filter((id: number) =>
      specialFlagIds.includes(id)
    );

    const initialCategory = initialIds.filter(
      (id: number) =>
        !specialFlagIds.includes(id) && !hiddenRootFlagIds.includes(id)
    );
    const initialBrand = (initialValues as any)?.brand;

    setSelectedBrandId(initialBrand?.id);

    form.setFieldsValue({
      ...initialValues,
      brandId: initialBrand?.id,
    });
    setSelectedIngredients(initialIngredientObjects);
    setSelectedSpecialFlagIds(initialSpecial);
    setSelectedCategoryFlagIds(initialCategory);
    setImages(
      Array.isArray(initialValues.images)
        ? initialValues.images.map((image) => ({
            imageUrl: image.image,
            imagePath: image.imageKey ?? undefined,
            thumbnailUrl: image.thumbnail || image.image,
            thumbnailPath: image.thumbnailKey ?? undefined,
            isNew: false,
          }))
        : [],
    );

    form.setFieldsValue({
      ...initialValues,
      compositionIds: initialIngredientObjects.map((ing: any) => ing.id),
      specialFlagIds: initialSpecial,
      categoryFlagIds: initialCategory,
    });
  }, [initialValues, form]);

  const ingredientOptions = Array.isArray(searchedIngredients)
    ? searchedIngredients.map((ingredient: any) => ({
        label: getIngredientLabel(ingredient),
        value: ingredient.id,
        ingredient,
      }))
    : [];

  const specialFlagOptions = flags
    .filter((flag: any) => specialFlagIds.includes(flag.id))
    .map((flag: any) => ({
      label: flagNamesFr[flag.name] || flag.name,
      value: flag.id,
    }));

  const categoryFlagOptions = flags
    .filter(
      (flag: any) =>
        !specialFlagIds.includes(flag.id) && !hiddenRootFlagIds.includes(flag.id)
    )
    .map((flag: any) => ({
      label: flagNamesFr[flag.name] || flag.name,
      value: flag.id,
    }));

  const handleIngredientSelectChange = (ids: number[]) => {
    const current = [...selectedIngredients];

    const searchedMap = new Map(
      ingredientOptions.map((option: any) => [option.value, option.ingredient])
    );

    const nextIngredients = ids
      .map((id) => {
        const existing = current.find((ing: any) => ing.id === id);
        if (existing) return existing;
        return searchedMap.get(id);
      })
      .filter(Boolean);

    setSelectedIngredients(nextIngredients);
    form.setFieldValue("compositionIds", ids);
  };

  const handleSpecialFlagsChange = (ids: number[]) => {
    setSelectedSpecialFlagIds(ids);
    form.setFieldValue("specialFlagIds", ids);
  };

  const handleCategoryFlagsChange = (ids: number[]) => {
    setSelectedCategoryFlagIds(ids);
    form.setFieldValue("categoryFlagIds", ids);
  };

  const buildFinalFlagIds = () => {
    const result = new Set<number>([
      ...selectedSpecialFlagIds,
      ...selectedCategoryFlagIds,
    ]);

    const hasHairChild = selectedCategoryFlagIds.some((id) =>
      hairSubFlagIds.includes(id)
    );
    const hasSkinChild = selectedCategoryFlagIds.some((id) =>
      skinSubFlagIds.includes(id)
    );

    if (hasHairChild) {
      result.add(4);
    }

    if (hasSkinChild) {
      result.add(13);
    }

    return Array.from(result);
  };

  const cleanupNewImages = async () => {
    const paths = images
      .filter((image) => image.isNew)
      .flatMap((image) => [image.imagePath, image.thumbnailPath])
      .filter((path): path is string => Boolean(path));
    await Promise.all(
      paths.map((path) => deleteUploadedFile(path).catch(() => undefined)),
    );
  };

  const handleFinish = async (values: any) => {
    const payload = {
      name: values.name,
      validScore: values.validScore,
      ean: values.ean,
      type: values.type,
      brandId: values.brandId ?? (initialValues as any)?.brand?.id,
      imageUrls: images.map((image) => image.imageUrl),
      thumbnailUrls: images.map((image) => image.thumbnailUrl),
      imageKeys: images.map((image) => image.imagePath || ""),
      thumbnailKeys: images.map((image) => image.thumbnailPath || ""),
      compositionIds: values.compositionIds ?? [],
      flagIds: buildFinalFlagIds(),
    };

    try {
      await onFinish(payload);
      setUploadsCommitted(true);
      setTimeout(() => onSaved?.(), 0);
    } catch {
      await cleanupNewImages();
      setImages((current) => current.filter((image) => !image.isNew));
      message.error("Erreur lors de la mise à jour du produit");
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      <Form.Item
        name="name"
        label="Nom"
        rules={[{ required: true, message: "Le nom est requis" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="brandId" hidden>
        <Input />
      </Form.Item>

      <Form.Item
        label="Marque"
        rules={[{ required: true, message: "La marque est requise" }]}
      >
        <Select
          showSearch
          placeholder="Rechercher une marque"
          value={selectedBrandId}
          filterOption={false}
          onSearch={setBrandSearch}
          onChange={handleBrandChange}
          loading={isSearchingBrands}
          options={brandOptions}
          notFoundContent={isSearchingBrands ? "Recherche..." : "Aucune marque"}
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item
        name="ean"
        label="EAN"
        rules={[{ required: true, message: "EAN requis" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="validScore" label="Score">
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="type" label="Type">
        <Input />
      </Form.Item>

      <Divider>Images</Divider>

      <MultipleProductImageUpload
        value={images}
        onChange={setImages}
        onUploadingChange={setImagesUploading}
        disabled={loading}
        committed={uploadsCommitted}
      />

      <Divider>Ingrédients</Divider>

      <Form.Item name="compositionIds" hidden>
        <Input />
      </Form.Item>

      <Form.Item label="Rechercher un ingrédient">
        <Select
          mode="multiple"
          showSearch
          value={selectedIngredients.map((ing: any) => ing.id)}
          placeholder="Chercher et ajouter des ingrédients"
          filterOption={false}
          onSearch={setIngredientSearch}
          onChange={handleIngredientSelectChange}
          loading={isSearchingIngredients}
          options={ingredientOptions}
          optionLabelProp="label"
          style={{ width: "100%" }}
        />
      </Form.Item>

      <div style={{ marginBottom: 16 }}>
        {selectedIngredients.map((ingredient: any) => (
          <Tag
            key={ingredient.id}
            closable
            style={{ marginBottom: 8 }}
            onClose={(e) => {
              e.preventDefault();
              const next = selectedIngredients.filter(
                (ing: any) => ing.id !== ingredient.id
              );
              setSelectedIngredients(next);
              form.setFieldValue(
                "compositionIds",
                next.map((ing: any) => ing.id)
              );
            }}
          >
            {getIngredientLabel(ingredient)}
          </Tag>
        ))}
      </div>

      <Divider>Mise en avant</Divider>

      <Form.Item name="specialFlagIds" hidden>
        <Input />
      </Form.Item>

      <Form.Item label="Flags spéciaux">
        <Select
          mode="multiple"
          placeholder="Sélectionner les flags spéciaux"
          value={selectedSpecialFlagIds}
          onChange={handleSpecialFlagsChange}
          loading={isLoadingFlags}
          options={specialFlagOptions}
          style={{ width: "100%" }}
        />
      </Form.Item>

      <div style={{ marginBottom: 16 }}>
        {selectedSpecialFlagIds.map((flagId) => {
          const flag = flags.find((f: any) => f.id === flagId);
          if (!flag) return null;

          return (
            <Tag
              key={flag.id}
              closable
              color="gold"
              style={{ marginBottom: 8 }}
              onClose={(e) => {
                e.preventDefault();
                const next = selectedSpecialFlagIds.filter((id) => id !== flag.id);
                setSelectedSpecialFlagIds(next);
                form.setFieldValue("specialFlagIds", next);
              }}
            >
              {flagNamesFr[flag.name] || flag.name}
            </Tag>
          );
        })}
      </div>

      <Divider>Catégories ciblées</Divider>

      <Form.Item name="categoryFlagIds" hidden>
        <Input />
      </Form.Item>

      <Form.Item label="Flags catégories">
        <Select
          mode="multiple"
          placeholder="Sélectionner les catégories ciblées"
          value={selectedCategoryFlagIds}
          onChange={handleCategoryFlagsChange}
          loading={isLoadingFlags}
          options={categoryFlagOptions}
          style={{ width: "100%" }}
        />
      </Form.Item>

      <div style={{ marginBottom: 16 }}>
        {selectedCategoryFlagIds.map((flagId) => {
          const flag = flags.find((f: any) => f.id === flagId);
          if (!flag) return null;

          return (
            <Tag
              key={flag.id}
              closable
              color="blue"
              style={{ marginBottom: 8 }}
              onClose={(e) => {
                e.preventDefault();
                const next = selectedCategoryFlagIds.filter((id) => id !== flag.id);
                setSelectedCategoryFlagIds(next);
                form.setFieldValue("categoryFlagIds", next);
              }}
            >
              {flagNamesFr[flag.name] || flag.name}
            </Tag>
          );
        })}
      </div>

      <Form.Item>
        <Button
          htmlType="submit"
          type="primary"
          loading={loading}
          disabled={imagesUploading}
          block
        >
          Enregistrer
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditProductForm;
