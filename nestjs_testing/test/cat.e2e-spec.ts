import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { CatsRepository } from "src/cats/cats.repository";
import { CatsService } from "src/cats/cats.service";
import { DatabaseModule } from "src/database/database.module";
import { DataSource } from "typeorm";
import { RequestHelper } from "utils/test.utils";

describe('Cats', () => {
    let app: INestApplication;
    let catsRepository: CatsRepository;
    let catsService: CatsService;

    let requestHelper: RequestHelper;
    let dataSource: DataSource;

    let catsId: number | undefined;
    let token;

    const domain = '/cats';

    beforeAll(async () => {
        const modules: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                DatabaseModule,
                CatsRepository,
                CatsService,
            ],
        }).compile();

        app = modules.createNestApplication();
        catsRepository = modules.get<CatsRepository>(CatsRepository);
        catsService = modules.get<CatsService>(CatsService);
        dataSource = modules.get<DataSource>(DataSource);
        requestHelper = new RequestHelper(app, token);

        await dataSource.synchronize(true);
        await app.init();
    });
});