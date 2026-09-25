import test from 'node:test'
import assert from 'node:assert/strict'

process.env.MONGO_URI ??= 'mongodb://127.0.0.1:27017/getemployed-test'
process.env.FRONTEND_ORIGINS ??= 'http://localhost:5173'
process.env.SESSION_SECRET ??= 'test-session-secret-that-is-long-enough'
process.env.PYTHON_SERVICE_URL ??= 'http://127.0.0.1:8000'

const { jobInputSchema, statusSchema } = await import('../src/schemas.js')
const { config } = await import('../src/config.js')

test('job input accepts frontend job contract and rejects non-http URLs', () => {
  const parsed = jobInputSchema.safeParse({ title: 'Engineer', company: 'Acme', url: 'https://example.com/job/1', source: 'Adzuna' })
  assert.equal(parsed.success, true)
  assert.equal(jobInputSchema.safeParse({ title: 'Engineer', company: 'Acme', url: 'javascript:alert(1)', source: 'Adzuna' }).success, false)
})

test('application status accepts only supported workflow states', () => {
  assert.equal(statusSchema.safeParse({ status: 'interviewing' }).success, true)
  assert.equal(statusSchema.safeParse({ status: 'pending' }).success, false)
})

test('proxy trust configuration parses the string false as false', () => {
  assert.equal(config.TRUST_PROXY, false)
})