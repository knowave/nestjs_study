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
      const newsItems = [];
      $('.item_issue').each((index, element) => {
        const image = $(element).find('.wrap_thumb img').attr('src');
        const category = $(element).find('.txt_category').text().trim();
        const title = $(element).find('.tit_g a').text().trim();

        newsItems.push({ image, category, title });
      });

      return newsItems;
    } catch (error) {
      throw new Error('크롤링에 실패하였습니다.');
    }
  }
}
