// crawling.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

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
      $('.cont_thumb').each((index, element) => {
        const image = $(element).find('.info_thumb').text();
        console.log('image: ', image);
        const item = $(element).text();
        data.push(item.trim());
      });

      return data;
    } catch (error) {
      throw new Error('크롤링에 실패하였습니다.');
    }
  }
}
