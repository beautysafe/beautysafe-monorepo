import { DeleteOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Image, Progress, Space, Typography } from 'antd';
import { useEffect, useId, useRef, useState } from 'react';
import {
  deleteUploadedFile,
  uploadImage,
  type UploadFolder,
} from '../../services/upload.service';

export interface ImageUploadValue {
  url: string;
  storagePath?: string;
  isNew?: boolean;
}

interface ImageUploadFieldProps {
  label: string;
  folder: UploadFolder;
  value?: ImageUploadValue | null;
  onChange: (value: ImageUploadValue | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
  committed?: boolean;
  required?: boolean;
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const validate = (file: File): string | null => {
  if (!IMAGE_TYPES.includes(file.type)) return 'Format accepté : JPEG, PNG, WebP ou AVIF.';
  if (!file.size) return 'Le fichier est vide.';
  if (file.size > MAX_IMAGE_SIZE) return "L'image ne doit pas dépasser 10 Mo.";
  return null;
};

export function ImageUploadField({
  label,
  folder,
  value,
  onChange,
  onUploadingChange,
  disabled = false,
  committed = false,
  required = false,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const valueRef = useRef(value);
  const committedRef = useRef(committed);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [failedFile, setFailedFile] = useState<File>();
  const [dragging, setDragging] = useState(false);

  valueRef.current = value;
  committedRef.current = committed;

  useEffect(
    () => () => {
      const current = valueRef.current;
      if (!committedRef.current && current?.isNew && current.storagePath) {
        void deleteUploadedFile(current.storagePath).catch(() => undefined);
      }
    },
    [],
  );

  const setBusy = (busy: boolean) => {
    setUploading(busy);
    onUploadingChange?.(busy);
  };

  const performUpload = async (file: File) => {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      setFailedFile(file);
      return;
    }
    setBusy(true);
    setProgress(0);
    setError(undefined);
    try {
      const uploaded = await uploadImage(file, folder, setProgress);
      const previous = valueRef.current;
      if (previous?.isNew && previous.storagePath) {
        await deleteUploadedFile(previous.storagePath).catch(() => undefined);
      }
      setFailedFile(undefined);
      onChange({ url: uploaded.url, storagePath: uploaded.storagePath, isNew: true });
    } catch {
      setError("L'envoi a échoué. Vous pouvez réessayer.");
      setFailedFile(file);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (value?.isNew && value.storagePath) {
      await deleteUploadedFile(value.storagePath).catch(() => undefined);
    }
    onChange(null);
    setError(undefined);
    setFailedFile(undefined);
  };

  return (
    <div>
      <Typography.Text strong>
        {label}{required ? ' *' : ''}
      </Typography.Text>
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
          const file = event.dataTransfer.files[0];
          if (file && !disabled && !uploading) void performUpload(file);
        }}
        style={{
          marginTop: 8,
          padding: 16,
          border: `1px dashed ${dragging ? '#1677ff' : '#d9d9d9'}`,
          borderRadius: 8,
          background: dragging ? '#e6f4ff' : undefined,
        }}
      >
        {value?.url && (
          <Image
            src={value.url}
            alt={`Aperçu – ${label}`}
            width={180}
            height={120}
            style={{ objectFit: 'cover', borderRadius: 6, marginBottom: 12 }}
          />
        )}
        <input
          id={inputId}
          type="file"
          accept={IMAGE_TYPES.join(',')}
          disabled={disabled || uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) void performUpload(file);
          }}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
        />
        <Space wrap>
          <Button
            icon={<UploadOutlined />}
            disabled={disabled || uploading}
            onClick={() => document.getElementById(inputId)?.click()}
          >
            {value ? 'Remplacer' : 'Choisir une image'}
          </Button>
          {value && (
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={disabled || uploading}
              onClick={() => void remove()}
              aria-label={`Supprimer ${label}`}
            >
              Supprimer
            </Button>
          )}
          {failedFile && (
            <Button
              icon={<ReloadOutlined />}
              disabled={disabled || uploading}
              onClick={() => void performUpload(failedFile)}
            >
              Réessayer
            </Button>
          )}
        </Space>
        <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
          Déposez une image ici ou utilisez le bouton. Maximum 10 Mo.
        </Typography.Paragraph>
        {uploading && <Progress percent={progress} status="active" aria-label="Progression de l'envoi" />}
      </div>
      {error && <Alert type="error" showIcon message={error} style={{ marginTop: 8 }} />}
    </div>
  );
}
