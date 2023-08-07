// crawling.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class CrawlingService {
  constructor() {}

  async crawlDataFromWebpage(url: string): Promise<any> {
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      // 웹 페이지에서 필요한 데이터 추출
      const data = [];
      $('selector-for-target-elements').each((index, element) => {
        const item = $(element).text();
        data.push(item);
      });

      return data;
    } catch (error) {
      throw new Error('크롤링에 실패하였습니다.');
    }
  }
}
