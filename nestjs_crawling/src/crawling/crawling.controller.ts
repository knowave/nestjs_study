import { Controller, Get } from '@nestjs/common';
import { CrawlingService } from './crawling.service';
import { ConfigService } from '@nestjs/config';

@Controller('crawling')
export class CrawlingController {
    constructor (
        private crawlingService: CrawlingService,
        private configService: ConfigService,
        ) {}

    @Get()
    async crawlDataFromWebpage(): Promise<any> {
        const url = this.configService.get<string>('CRAWLING_URL');
        return await this.crawlingService.crawlDataFromWebpage(url);
    }
}
