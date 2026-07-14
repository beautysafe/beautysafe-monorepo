import {
  Body,
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FirebaseStorageService } from './firebase-storage.service';
import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from './file-validation';
import { UploadFolder } from './upload-folder.enum';

const uploadedFileSchema = {
  type: 'object',
  required: ['url', 'storagePath', 'filename', 'contentType', 'size'],
  properties: {
    url: { type: 'string', format: 'uri' },
    storagePath: { type: 'string' },
    filename: { type: 'string' },
    contentType: { type: 'string' },
    size: { type: 'number' },
  },
};

@ApiTags('uploads')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
@ApiForbiddenResponse({ description: 'Administrator role required' })
@Roles(UserRole.ADMIN)
@Controller('uploads')
export class StorageController {
  constructor(private readonly storage: FirebaseStorageService) {}

  @Post('images')
  @ApiOperation({ summary: 'Upload an image to an allowed Firebase folder' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'folder'],
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', enum: Object.values(UploadFolder) },
      },
    },
  })
  @ApiCreatedResponse({ schema: uploadedFileSchema })
  @ApiBadRequestResponse({
    description: 'Missing, empty, invalid, or unsupported image',
  })
  @ApiPayloadTooLargeResponse({ description: 'Image exceeds 10 MB' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE },
    }),
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: UploadFolder,
  ) {
    return this.storage.uploadImage(file, folder);
  }

  @Post('product-images')
  @ApiOperation({ summary: 'Upload and generate a WebP product image pair' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      required: ['imageUrl', 'imagePath', 'thumbnailUrl', 'thumbnailPath'],
      properties: {
        imageUrl: { type: 'string', format: 'uri' },
        imagePath: { type: 'string' },
        thumbnailUrl: { type: 'string', format: 'uri' },
        thumbnailPath: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Missing, empty, invalid, or unsupported image',
  })
  @ApiPayloadTooLargeResponse({ description: 'Image exceeds 10 MB' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE },
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    return this.storage.uploadProductImage(file);
  }

  @Post('videos')
  @ApiOperation({ summary: 'Upload a video to an allowed Firebase folder' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'folder'],
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', enum: Object.values(UploadFolder) },
      },
    },
  })
  @ApiCreatedResponse({ schema: uploadedFileSchema })
  @ApiBadRequestResponse({
    description: 'Missing, empty, invalid, or unsupported video',
  })
  @ApiPayloadTooLargeResponse({ description: 'Video exceeds 100 MB' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_VIDEO_SIZE },
    }),
  )
  uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: UploadFolder,
  ) {
    return this.storage.uploadVideo(file, folder);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete an unreferenced Firebase object by storage path',
  })
  @ApiQuery({ name: 'storagePath', type: String, required: true })
  @ApiOkResponse({
    schema: { type: 'object', properties: { deleted: { type: 'boolean' } } },
  })
  @ApiBadRequestResponse({ description: 'Unsafe or non-upload storage path' })
  @ApiConflictResponse({
    description: 'Object is still referenced by the database',
  })
  async deleteFile(@Query('storagePath') storagePath: string) {
    await this.storage.deleteFile(storagePath);
    return { deleted: true };
  }
}
