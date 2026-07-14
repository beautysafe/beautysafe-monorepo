import { Global, Module } from '@nestjs/common';
import { FirebaseStorageService } from './firebase-storage.service';
import { StorageController } from './storage.controller';

@Global()
@Module({
  controllers: [StorageController],
  providers: [FirebaseStorageService],
  exports: [FirebaseStorageService],
})
export class StorageModule {}
