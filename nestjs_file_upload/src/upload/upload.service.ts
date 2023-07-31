import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config(); // Load Environment varriable from .env file

AWS.config.update({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

@Injectable()
export class UploadService {
  async uploadImages(images: Express.MulterS3.File[]): Promise<string[]> {
    const uploadPromises = images.map((image) => {
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}_${image.originalname}`,
        Body: image.buffer,
        ACL: 'public-read',
      };

      return s3.upload(uploadParams).promise();
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return uploadedImages.map((image) => image.Location);
  }
}
