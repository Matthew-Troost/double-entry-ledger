import * as request from 'supertest';
import { InMemoryStore } from '@/modules/database/providers/InMemoryStore';
import { ApiPublicModule } from '@/apps/api-public/ApiPublic.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DomainExceptionFilter } from '@/common/filters/domain-exception.filter';

describe('AccountController', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  let inMemoryStore: InMemoryStore;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [ApiPublicModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalFilters(new DomainExceptionFilter());

    await app.init();

    inMemoryStore = moduleFixture.get<InMemoryStore>(InMemoryStore);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    inMemoryStore.accounts = [];
    inMemoryStore.transactions = [];
    inMemoryStore.entries = [];
  });

  describe('[POST] /accounts', () => {
    it('should throw an error if the given id belongs to an existing account', async () => {
      const id = '797ff57a-948a-4dc0-b097-c4bc0ea81800';

      inMemoryStore.accounts.push({ id, direction: 'debit', balance: 0 });

      const response = await request(app.getHttpServer())
        .post('/accounts')
        .send({
          id,
          name: 'test3',
          direction: 'debit',
        });

      expect(response.statusCode).toBe(409);
      expect(response.body).toStrictEqual({
        message:
          'An account with id "797ff57a-948a-4dc0-b097-c4bc0ea81800" already exists',
        statusCode: 409,
      });
    });

    it.only('should return the payload for a newly created account', async () => {
      const response = await request(app.getHttpServer())
        .post('/accounts')
        .send({
          name: 'test3',
          direction: 'debit',
          id: '71cde2aa-b9bc-496a-a6f1-34964d05e6fd',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toStrictEqual({
        balance: 0,
        direction: 'debit',
        id: '71cde2aa-b9bc-496a-a6f1-34964d05e6fd',
        name: 'test3',
      });
    });
  });

  describe('[GET] /accounts/:id', () => {
    it('should return null if there is no account for the given id', async () => {
      const response = await request(app.getHttpServer()).get(
        '/accounts/fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
      );

      expect(response.statusCode).toBe(404);
      expect(response.body).toStrictEqual({
        message:
          'Account with id "fa967ec9-5be2-4c26-a874-7eeeabfc6da8" cannot be found',
        statusCode: 404,
      });
    });

    it('should return the payload for a newly created account', async () => {
      const id = '797ff57a-948a-4dc0-b097-c4bc0ea81800';

      inMemoryStore.accounts.push({
        id,
        direction: 'debit',
        balance: 100,
        name: 'Test Account',
      });

      const response = await request(app.getHttpServer()).get(
        `/accounts/${id}`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toStrictEqual({
        balance: 100,
        direction: 'debit',
        id: '797ff57a-948a-4dc0-b097-c4bc0ea81800',
        name: 'Test Account',
      });
    });
  });
});
