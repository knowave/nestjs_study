import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { PutObjectDto } from './dto/put-object.dto';

@Injectable()
export class S3Service {
  private readonly s3: S3;
  private readonly bucketName: string;

  constructor() {
    this.bucketName = process.env.BUCKET_NAME;
    this.s3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });
  }

  async putObject(
    putObjectDto: PutObjectDto,
  ): Promise<S3.Types.PutObjectOutput> {
    const { key, body, contentType, bucket } = putObjectDto;

    return await this.s3
      .putObject({
        Key: key,
        Body: body,
        Bucket: bucket || this.bucketName,
        ACL: 'public-read',
        ...(contentType && { ContentType: contentType }),
      })
      .promise();
  }
}
