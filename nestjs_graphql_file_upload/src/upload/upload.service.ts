import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { FileUpload } from './interfaces/file-upload.interface';
import { UploadInput } from './dto/upload.input';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  constructor(private readonly s3Service: S3Service) {}

  async uploadFile(uploadInput: UploadInput): Promise<string> {
    const { imageFile } = uploadInput;

    if (imageFile) {
      const image = await imageFile;
      this.logger.log(image);
    }

    return 'success';
  }
}
