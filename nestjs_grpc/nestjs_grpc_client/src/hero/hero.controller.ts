import { Controller, Get, OnModuleInit, Param } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { grpcClientOptions } from 'src/grpc-hero.options';

interface HeroService {
  findOne(data: { id: number }): Observable<any>;
}

@Controller('hero')
export class HeroController implements OnModuleInit {
  @Client(grpcClientOptions) private readonly client: ClientGrpc;
  private heroService: HeroService;

  onModuleInit() {
    this.heroService = this.client.getService<HeroService>('HeroService');
  }

  @Get(':id')
  call(@Param() params): Observable<any> {
    return this.heroService.findOne({ id: +params.id });
  }
}
