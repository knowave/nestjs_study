import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadResolver } from './upload.resolver';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [S3Module],
  providers: [UploadService, UploadResolver],
})
export class UploadModule {}
