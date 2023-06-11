import { INestApplication } from '@nestjs/common';
import { Test } from 'supertest';
import * as request from 'supertest';

export class RequestHelper {
  constructor(private app: INestApplication, private token: string) {}

  /**
   * Get Method
   * @param url
   * @param query
   * @returns
   */
  async get(url: string, query?: string): Promise<Test> {
    return request(this.app.getHttpServer())
      .get(url)
      .query(query)
      .set({ Authorization: `Bearer ${this.token}` });
  }

  /**
   * Post Method
   * @param url
   * @param body
   * @returns
   */
  async post(url: string, body?: any): Promise<Test> {
    return request(this.app.getHttpServer())
      .post(url)
      .send(body)
      .set({ Authorization: `Bearer ${this.token}` });
  }

  /**
   * Patch Method
   * @param url
   * @param body
   * @returns
   */
  async patch(url: string, body?: any): Promise<Test> {
    return request(this.app.getHttpServer())
      .patch(url)
      .send(body)
      .set({ Authorization: `Bearer ${this.token}` });
  }

  async delete(url: string): Promise<Test> {
    return request(this.app.getHttpServer())
      .delete(url)
      .set({ Authorization: `Bearer ${this.token}` });
  }
}
