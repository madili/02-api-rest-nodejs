import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    })

    expect(response.statusCode).toEqual(201)
  })

  it('should be able to list all transactions', async () => {
    const transaction = {
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    }
    const responseTransaction = await request(app.server)
      .post('/transactions')
      .send(transaction)

    const cookies = responseTransaction.get('Set-Cookie')

    const response = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(response.statusCode).toEqual(200)
    expect(response.body.transactions).toEqual([
      expect.objectContaining({
        title: transaction.title,
        amount: transaction.amount,
      }),
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const transaction = {
      title: 'New transaction specific',
      amount: 1500,
      type: 'credit',
    }
    const responseTransaction = await request(app.server)
      .post('/transactions')
      .send(transaction)

    const cookies = responseTransaction.get('Set-Cookie')

    const listTransactions = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
    const transactionId = listTransactions.body.transactions[0].id

    const response = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)

    expect(response.statusCode).toEqual(200)
    expect(response.body.transaction).toEqual(
      expect.objectContaining({
        title: transaction.title,
        amount: transaction.amount,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const creditTransaction = {
      title: 'Credit transaction',
      amount: 5000,
      type: 'credit',
    }

    const debitTransaction = {
      title: 'Debit transaction',
      amount: 2000,
      type: 'debit',
    }

    const responseTransaction = await request(app.server)
      .post('/transactions')
      .send(creditTransaction)

    const cookies = responseTransaction.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send(debitTransaction)

    const response = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    expect(response.statusCode).toEqual(200)
    expect(response.body.summary).toEqual({
      amount: 3000,
    })
  })
})
