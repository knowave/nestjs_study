import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { Cats } from './entities/cats.entity';
import { CatsRepository } from './cats.repository';
import { CreateCatDto } from './dto/create-cat.dto';
import { NotFoundException } from '@nestjs/common';

const mockRepository = {
  deleteCat: jest.fn(),
  updateCat: jest.fn(),
  findAllByCats: jest.fn(),
  findOneById: jest.fn(),
  createCat: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CatsService', () => {
  let service: CatsService;
  let repository: CatsRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: CatsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    repository = module.get<CatsRepository>(CatsRepository);
  });

  describe('findAllByCats', () => {
    it('should return a list of cats', async () => {
      const paginationQuery = {
        page: 1,
        limit: 10,
      };

      const paginateCats = {
        items: [
          { catsId: 1, name: 'test1' },
          { catsId: 2, name: 'test2' },
          { catsId: 3, name: 'test3' },
          { catsId: 4, name: 'test4' },
          { catsId: 5, name: 'test5' },
        ],
        meta: {
          totalItems: 5,
          itemCount: 5,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      jest.spyOn(service, 'findAllByCats').mockResolvedValue(paginateCats);

      const result = await service.findAllByCats(paginationQuery);

      expect(result).toEqual(paginateCats);
      expect(service.findAllByCats).toHaveBeenCalledWith(paginationQuery);
    });
  });

  describe('findOneById', () => {
    it('should find a cat by Id', async () => {
      const catId = 1;
      const cat: Cats = {
        catsId: catId,
        name: 'cat1',
      };

      jest.spyOn(repository, 'findOneById').mockResolvedValue(cat);

      const result = await service.findOneById(catId);

      expect(result).toEqual(cat);
      expect(repository.findOneById).toHaveBeenCalledWith(catId);
    });

    it('should throw NotFoundException if cat is not found', async () => {
      const catId = 1;

      jest.spyOn(repository, 'findOneById').mockResolvedValue(undefined);

      await expect(service.findOneById(catId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('createCat', () => {
    it('create new cat', async () => {
      const createCatDto: CreateCatDto = {
        name: 'newCat',
      };

      const saveCat: Cats = {
        catsId: 1,
        name: 'newCat',
      };

      jest.spyOn(repository, 'createCat').mockResolvedValue(saveCat);

      const result = await service.createCat(createCatDto);

      expect(result).toEqual(saveCat);
      expect(repository.createCat).toHaveBeenCalledWith(createCatDto);
    });
  });

  describe('update', () => {
    it('should update a cat', async () => {
      const catId = 1;
      const updatedCatData: Cats = { catsId: catId, name: 'Snowball' };
      const existingCat: Cats = { catsId: catId, name: 'Whiskers' };
      const updatedCat: Cats = { catsId: catId, name: 'Snowball' };

      jest.spyOn(repository, 'findOneById').mockResolvedValue(existingCat);
      jest.spyOn(repository, 'updateCat').mockResolvedValue(updatedCat);

      const result = await service.update(catId, updatedCatData);

      expect(result).toEqual(updatedCat);
      expect(repository.findOneById).toHaveBeenCalledWith(catId);
      expect(repository.updateCat).toHaveBeenCalledWith(existingCat);
    });

    it('should throw NotFoundException if cat is not found', async () => {
      const catId = 1;
      const updatedCatData: Cats = { catsId: catId, name: 'Snowball' };

      jest.spyOn(repository, 'findOneById').mockResolvedValue(undefined);

      await expect(service.update(catId, updatedCatData)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a cat', async () => {
      const catId = 1;
      const existingCat: Cats = { catsId: catId, name: 'test' };

      jest.spyOn(repository, 'findOneById').mockResolvedValue(existingCat);
      jest.spyOn(repository, 'deleteCat').mockResolvedValue(undefined);

      await service.delete(catId);

      expect(repository.findOneById).toHaveBeenCalledWith(catId);
      expect(repository.deleteCat).toHaveBeenCalledWith(catId);
    });

    it('should throw NotFoundException if cat is not found', async () => {
      const catId = 1;

      jest.spyOn(repository, 'findOneById').mockResolvedValue(undefined);

      await expect(service.delete(catId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
