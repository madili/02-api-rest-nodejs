import { expect, test } from 'vitest'

// import assert from 'node:assert'
// import test from 'node:test'

test('teste nativo no node', () => {
  const statusCode = 201

  expect(statusCode).toEqual(201)
})

// test('teste nativo no node', () => {
//   const statusCode = 201

//   assert.strictEqual(statusCode, 201)
// })
