import { BadRequestException } from '@nestjs/common';
import {
  buildStoragePath,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  validateImageFile,
  validateStoragePath,
  validateUploadFolder,
  validateVideoFile,
} from './file-validation';
import { UploadFolder } from './upload-folder.enum';

const file = (
  mimetype: string,
  size = 1,
  buffer = Buffer.from('x'),
): Express.Multer.File =>
  ({
    fieldname: 'file',
    originalname: 'customer supplied name.png',
    encoding: '7bit',
    mimetype,
    size,
    buffer,
  }) as Express.Multer.File;

describe('file validation', () => {
  it('accepts only configured image MIME types', () => {
    expect(validateImageFile(file('image/jpeg'))).toBe('jpg');
    expect(validateImageFile(file('image/avif'))).toBe('avif');
    expect(() => validateImageFile(file('image/gif'))).toThrow(
      BadRequestException,
    );
  });

  it('rejects missing, empty, and oversized images', () => {
    expect(() => validateImageFile(undefined)).toThrow('File is required');
    expect(() =>
      validateImageFile(file('image/png', 0, Buffer.alloc(0))),
    ).toThrow('File must not be empty');
    expect(() =>
      validateImageFile(file('image/png', MAX_IMAGE_SIZE + 1)),
    ).toThrow('maximum allowed size');
  });

  it('accepts MP4/WebM and rejects oversized or unsupported videos', () => {
    expect(validateVideoFile(file('video/mp4'))).toBe('mp4');
    expect(validateVideoFile(file('video/webm'))).toBe('webm');
    expect(() => validateVideoFile(file('video/quicktime'))).toThrow(
      BadRequestException,
    );
    expect(() =>
      validateVideoFile(file('video/mp4', MAX_VIDEO_SIZE + 1)),
    ).toThrow('maximum allowed size');
  });

  it('validates folders against the fixed enum', () => {
    expect(validateUploadFolder('banners')).toBe(UploadFolder.BANNERS);
    expect(() => validateUploadFolder('../private')).toThrow(
      'Invalid upload folder',
    );
    expect(() => validateUploadFolder('custom')).toThrow(
      'Invalid upload folder',
    );
  });

  it('generates unique safe paths without using the original name', () => {
    const date = new Date('2026-07-14T12:00:00Z');
    const first = buildStoragePath(UploadFolder.STORIES, 'webp', date);
    const second = buildStoragePath(UploadFolder.STORIES, 'webp', date);
    expect(first).toMatch(/^stories\/2026\/07\/[0-9a-f-]{36}\.webp$/);
    expect(second).not.toBe(first);
    expect(first).not.toContain('customer supplied name');
  });

  it('rejects URLs, traversal, encoded paths, and non-upload object paths', () => {
    const valid = buildStoragePath(UploadFolder.GROUPS, 'png');
    expect(validateStoragePath(valid)).toBe(valid);
    expect(() =>
      validateStoragePath('https://example.com/groups/file.png'),
    ).toThrow(BadRequestException);
    expect(() => validateStoragePath('groups/../../secret.json')).toThrow(
      BadRequestException,
    );
    expect(() => validateStoragePath('groups/%2e%2e/secret.json')).toThrow(
      BadRequestException,
    );
    expect(() => validateStoragePath('unmanaged/file.png')).toThrow(
      BadRequestException,
    );
  });
});
