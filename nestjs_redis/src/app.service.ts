import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager'; 

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getCache() {
    const value = await this.cacheManager.get('key');

    if (value) {
      return 'Value!' + value;
    }
  }
}
