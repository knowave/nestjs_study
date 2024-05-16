import { S3 } from 'aws-sdk';

export class PutObjectDto {
  key: string;
  body: S3.Body;
  contentType?: string;
  bucket?: string;
}
