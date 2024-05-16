import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  async uploadFile(string: string): Promise<string> {
    return string;
  }
}
