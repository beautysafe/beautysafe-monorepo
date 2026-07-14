import { DeleteOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Progress, Space, Typography } from 'antd';
import { useEffect, useId, useRef, useState } from 'react';
import {
  deleteUploadedFile,
  uploadVideo,
  type UploadFolder,
} from '../../services/upload.service';

export interface VideoUploadValue {
  url: string;
  storagePath?: string;
  isNew?: boolean;
}

interface Props {
  label: string;
  folder: UploadFolder;
  value: VideoUploadValue[];
  onChange: (value: VideoUploadValue[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  multiple?: boolean;
  disabled?: boolean;
  committed?: boolean;
}

const TYPES = ['video/mp4', 'video/webm'];
const MAX_SIZE = 100 * 1024 * 1024;

const validationMessage = (file: File) => {
  if (!TYPES.includes(file.type)) return `${file.name} : utilisez MP4 ou WebM.`;
  if (!file.size) return `${file.name} : fichier vide.`;
  if (file.size > MAX_SIZE) return `${file.name} : taille supérieure à 100 Mo.`;
  return undefined;
};

export function VideoUploadField({
  label,
  folder,
  value,
  onChange,
  onUploadingChange,
  multiple = false,
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
      for (const video of valueRef.current.filter((item) => item.isNew)) {
        if (video.storagePath)
          void deleteUploadedFile(video.storagePath).catch(() => undefined);
      }
    },
    [],
  );

  const setBusy = (busy: boolean) => {
    setUploading(busy);
    onUploadingChange?.(busy);
  };

  const addFiles = async (files: File[]) => {
    const selected = multiple ? files : files.slice(0, 1);
    const invalid = selected.filter(validationMessage);
    const valid = selected.filter((file) => !validationMessage(file));
    setFailedFiles(invalid);
    setError(invalid.map(validationMessage).filter(Boolean).join(' ') || undefined);
    if (!valid.length) return;

    setBusy(true);
    let next = multiple ? [...valueRef.current] : [];
    const failures = [...invalid];
    try {
      for (let index = 0; index < valid.length; index += 1) {
        const file = valid[index];
        try {
          const uploaded = await uploadVideo(file, folder, (percent) => {
            setProgress(Math.round(((index + percent / 100) / valid.length) * 100));
          });
          next = [
            ...next,
            { url: uploaded.url, storagePath: uploaded.storagePath, isNew: true },
          ];
          onChange(next);
        } catch {
          failures.push(file);
        }
      }
      if (failures.length) {
        setFailedFiles(failures);
        setError("Certaines vidéos n'ont pas pu être envoyées. Réessayez.");
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (index: number) => {
    const video = value[index];
    if (video.isNew && video.storagePath) {
      await deleteUploadedFile(video.storagePath).catch(() => undefined);
    }
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
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
          multiple={multiple}
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
          {multiple ? 'Ajouter des vidéos' : value.length ? 'Remplacer' : 'Choisir une vidéo'}
        </Button>
        <Typography.Paragraph type="secondary" style={{ margin: '8px 0' }}>
          MP4 ou WebM, maximum 100 Mo par vidéo. Le glisser-déposer est accepté.
        </Typography.Paragraph>
        {uploading && <Progress percent={progress} status="active" />}
      </div>

      <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
        {value.map((video, index) => (
          <div key={`${video.storagePath ?? video.url}-${index}`}>
            <video
              src={video.url}
              controls
              preload="metadata"
              aria-label={`${label} ${index + 1}`}
              style={{ width: '100%', maxWidth: 420, borderRadius: 6 }}
            />
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={disabled || uploading}
              onClick={() => void remove(index)}
              style={{ marginTop: 6 }}
            >
              Supprimer
            </Button>
          </div>
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
          Réessayer
        </Button>
      )}
    </div>
  );
}
