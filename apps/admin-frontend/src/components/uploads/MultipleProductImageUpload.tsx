import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Image, Progress, Space, Typography } from 'antd';
import { useEffect, useId, useRef, useState } from 'react';
import {
  deleteUploadedFile,
  uploadProductImage,
} from '../../services/upload.service';

export interface ProductImageUploadValue {
  imageUrl: string;
  imagePath?: string;
  thumbnailUrl: string;
  thumbnailPath?: string;
  isNew?: boolean;
}

interface Props {
  label?: string;
  value: ProductImageUploadValue[];
  onChange: (value: ProductImageUploadValue[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
  committed?: boolean;
}

const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 10 * 1024 * 1024;

const validationMessage = (file: File) => {
  if (!TYPES.includes(file.type)) return `${file.name} : format non pris en charge.`;
  if (!file.size) return `${file.name} : fichier vide.`;
  if (file.size > MAX_SIZE) return `${file.name} : taille supérieure à 10 Mo.`;
  return undefined;
};

export function MultipleProductImageUpload({
  label = 'Images du produit',
  value,
  onChange,
  onUploadingChange,
  disabled = false,
  committed = false,
}: Props) {
  const inputId = useId();
  const valueRef = useRef(value);
  const committedRef = useRef(committed);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  valueRef.current = value;
  committedRef.current = committed;

  useEffect(
    () => () => {
      if (committedRef.current) return;
      for (const image of valueRef.current.filter((item) => item.isNew)) {
        if (image.imagePath) void deleteUploadedFile(image.imagePath).catch(() => undefined);
        if (image.thumbnailPath)
          void deleteUploadedFile(image.thumbnailPath).catch(() => undefined);
      }
    },
    [],
  );

  const setBusy = (busy: boolean) => {
    setUploading(busy);
    onUploadingChange?.(busy);
  };

  const addFiles = async (files: File[]) => {
    const invalid = files.filter(validationMessage);
    const valid = files.filter((file) => !validationMessage(file));
    if (invalid.length) {
      setFailedFiles(invalid);
      setError(invalid.map(validationMessage).filter(Boolean).join(' '));
    } else {
      setError(undefined);
      setFailedFiles([]);
    }
    if (!valid.length) return;

    setBusy(true);
    let next = [...valueRef.current];
    const failures: File[] = [...invalid];
    try {
      for (let index = 0; index < valid.length; index += 1) {
        const file = valid[index];
        try {
          const uploaded = await uploadProductImage(file, (percent) => {
            setProgress(Math.round(((index + percent / 100) / valid.length) * 100));
          });
          next = [
            ...next,
            {
              ...uploaded,
              isNew: true,
            },
          ];
          onChange(next);
        } catch {
          failures.push(file);
        }
      }
      if (failures.length) {
        setFailedFiles(failures);
        setError("Certaines images n'ont pas pu être envoyées. Réessayez.");
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (index: number) => {
    const item = value[index];
    if (item.isNew) {
      await Promise.all([
        item.imagePath
          ? deleteUploadedFile(item.imagePath).catch(() => undefined)
          : Promise.resolve(),
        item.thumbnailPath
          ? deleteUploadedFile(item.thumbnailPath).catch(() => undefined)
          : Promise.resolve(),
      ]);
    }
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  };

  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <Typography.Text strong>{label}</Typography.Text>
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled && !uploading) void addFiles(Array.from(event.dataTransfer.files));
        }}
        style={{
          marginTop: 8,
          padding: 16,
          border: `1px dashed ${dragging ? '#1677ff' : '#d9d9d9'}`,
          borderRadius: 8,
          background: dragging ? '#e6f4ff' : undefined,
        }}
      >
        <input
          id={inputId}
          type="file"
          multiple
          accept={TYPES.join(',')}
          disabled={disabled || uploading}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = '';
            if (files.length) void addFiles(files);
          }}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
        />
        <Button
          icon={<UploadOutlined />}
          disabled={disabled || uploading}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          Ajouter des images
        </Button>
        <Typography.Paragraph type="secondary" style={{ margin: '8px 0' }}>
          La première image est l'image principale. Les miniatures sont générées automatiquement.
        </Typography.Paragraph>
        {uploading && <Progress percent={progress} status="active" />}
      </div>

      <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
        {value.map((item, index) => (
          <Card key={`${item.imagePath ?? item.imageUrl}-${index}`} size="small">
            <Space align="start" wrap>
              <Image
                src={item.thumbnailUrl || item.imageUrl}
                alt={`Image produit ${index + 1}`}
                width={96}
                height={96}
                style={{ objectFit: 'cover', borderRadius: 6 }}
              />
              <Space wrap>
                <Button
                  icon={<ArrowUpOutlined />}
                  disabled={disabled || uploading || index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={`Déplacer l'image ${index + 1} vers le haut`}
                />
                <Button
                  icon={<ArrowDownOutlined />}
                  disabled={disabled || uploading || index === value.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`Déplacer l'image ${index + 1} vers le bas`}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={disabled || uploading}
                  onClick={() => void remove(index)}
                  aria-label={`Supprimer l'image ${index + 1}`}
                >
                  Supprimer
                </Button>
              </Space>
            </Space>
          </Card>
        ))}
      </Space>

      {error && <Alert type="error" showIcon message={error} style={{ marginTop: 8 }} />}
      {failedFiles.length > 0 && (
        <Button
          icon={<ReloadOutlined />}
          disabled={disabled || uploading}
          onClick={() => void addFiles(failedFiles)}
          style={{ marginTop: 8 }}
        >
          Réessayer les envois échoués
        </Button>
      )}
    </div>
  );
}
