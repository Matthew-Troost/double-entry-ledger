import * as request from 'supertest';
import { InMemoryStore } from '@/modules/database/providers/InMemoryStore';
import { ApiPublicModule } from '@/apps/api-public/ApiPublic.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DomainExceptionFilter } from '@/common/filters/domain-exception.filter';

describe('TransactionController', () => {
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

  describe('[POST] /transactions', () => {
    it('should throw an error if any amounts are 0', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({
          name: 'test',
          id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
          entries: [
            {
              direction: 'debit',
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: 100,
            },
            {
              direction: 'credit',
              account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
              amount: 100,
            },
            {
              direction: 'credit',
              account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
              amount: 0,
            },
          ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Entry amounts must be positive',
        statusCode: 400,
      });
    });

    it('should throw an error if any amounts are negative', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({
          name: 'test',
          id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
          entries: [
            {
              direction: 'debit',
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: -100,
            },
            {
              direction: 'credit',
              account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
              amount: -100,
            },
          ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Entry amounts must be positive',
        statusCode: 400,
      });
    });

    it('should throw an error if the sum of debits does not equal the sum of credits', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({
          name: 'test',
          id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
          entries: [
            {
              direction: 'debit',
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: 100,
            },
            {
              direction: 'credit',
              account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
              amount: 99,
            },
          ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message:
          'The sum of debit amounts must equal the sum of credit amounts',
        statusCode: 400,
      });
    });

    it('should throw an error if there is more than one debit per account', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({
          name: 'test',
          id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
          entries: [
            {
              direction: 'debit',
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: 50,
            },
            {
              direction: 'debit',
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: 50,
            },
            {
              direction: 'credit',
              account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
              amount: 100,
            },
          ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Only one debit and one credit entry per account is allowed.',
        statusCode: 400,
      });
    });

    it('should throw an error if there is more than one credit per account', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({
          name: 'test',
          id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
          entries: [
            {
              direction: 'debit',
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: 100,
            },
            {
              direction: 'credit',
              account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
              amount: 50,
            },
            {
              direction: 'credit',
              account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
              amount: 50,
            },
          ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Only one debit and one credit entry per account is allowed.',
        statusCode: 400,
      });
    });

    it('should throw an error if there is not more than 1 distinct account id', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({
          name: 'test',
          id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
          entries: [
            {
              direction: 'debit',
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: 100,
            },
            {
              direction: 'credit',
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: 100,
            },
          ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message:
          "A transaction must include entries for at least two different account id's.",
        statusCode: 400,
      });
    });

    it('should throw an error if an account id does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({
          name: 'test',
          id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
          entries: [
            {
              direction: 'debit',
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: 100,
            },
            {
              direction: 'credit',
              account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
              amount: 100,
            },
          ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: "One or more account id's cannot be found",
        statusCode: 400,
      });
    });

    it('should throw an error if a transaction exists with the same id', async () => {
      inMemoryStore.accounts.push({
        id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
        balance: 0,
        direction: 'debit',
      });
      inMemoryStore.accounts.push({
        id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
        balance: 0,
        direction: 'debit',
      });

      inMemoryStore.transactions.push({
        id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
      });

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({
          name: 'test',
          id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
          entries: [
            {
              direction: 'debit',
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: 100,
            },
            {
              direction: 'credit',
              account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
              amount: 100,
            },
          ],
        });

      expect(response.statusCode).toBe(409);
      expect(response.body).toStrictEqual({
        message:
          'A transaction with id "3256dc3c-7b18-4a21-95c6-146747cf2971" already exists',
        statusCode: 409,
      });
    });

    describe('happy paths', () => {
      test('when both accounts have the same direction as the entry', async () => {
        inMemoryStore.accounts.push({
          id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
          balance: 0,
          direction: 'debit',
        });
        inMemoryStore.accounts.push({
          id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
          balance: 0,
          direction: 'credit',
        });

        const response = await request(app.getHttpServer())
          .post('/transactions')
          .send({
            name: 'test',
            id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
            entries: [
              {
                direction: 'debit',
                account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
                amount: 100,
              },
              {
                direction: 'credit',
                account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
                amount: 100,
              },
            ],
          });

        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
          entries: [
            {
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: 100,
              direction: 'debit',
              id: expect.any(String),
            },
            {
              account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
              amount: 100,
              direction: 'credit',
              id: expect.any(String),
            },
          ],
          id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
          name: 'test',
        });
        expect(inMemoryStore.accounts).toStrictEqual([
          {
            balance: 100,
            direction: 'debit',
            id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
          },
          {
            balance: 100,
            direction: 'credit',
            id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
          },
        ]);
      });

      test('when both accounts have different directions to the entry', async () => {
        inMemoryStore.accounts.push({
          id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
          balance: 100,
          direction: 'debit',
        });
        inMemoryStore.accounts.push({
          id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
          balance: 100,
          direction: 'credit',
        });

        inMemoryStore.entries.push({
          account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
          amount: 100,
          direction: 'debit',
          id: 'abc',
          transaction_id: 'def',
        });
        inMemoryStore.entries.push({
          account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
          amount: 100,
          direction: 'credit',
          id: 'abc',
          transaction_id: 'def',
        });

        const response = await request(app.getHttpServer())
          .post('/transactions')
          .send({
            name: 'test',
            id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
            entries: [
              {
                direction: 'credit',
                account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
                amount: 100,
              },
              {
                direction: 'debit',
                account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
                amount: 100,
              },
            ],
          });

        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
          entries: [
            {
              account_id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
              amount: 100,
              direction: 'credit',
              id: expect.any(String),
            },
            {
              account_id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
              amount: 100,
              direction: 'debit',
              id: expect.any(String),
            },
          ],
          id: '3256dc3c-7b18-4a21-95c6-146747cf2971',
          name: 'test',
        });
        expect(inMemoryStore.accounts).toStrictEqual([
          {
            balance: 0,
            direction: 'debit',
            id: 'fa967ec9-5be2-4c26-a874-7eeeabfc6da8',
          },
          {
            balance: 0,
            direction: 'credit',
            id: 'dbf17d00-8701-4c4e-9fc5-6ae33c324309',
          },
        ]);
      });
    });
  });
});
