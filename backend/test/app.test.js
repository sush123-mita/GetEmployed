import test from 'node:test'
import assert from 'node:assert/strict'

process.env.MONGO_URI ??= 'mongodb://127.0.0.1:27017/getemployed-test'
process.env.FRONTEND_ORIGINS ??= 'http://localhost:5173'
process.env.SESSION_SECRET ??= 'test-session-secret-that-is-long-enough'
process.env.PYTHON_SERVICE_URL ??= 'http://127.0.0.1:8000'

const { createApp } = await import('../src/app.js')

async function withServer(callback) {
  const server = createApp().listen(0)
  await new Promise(resolve => server.once('listening', resolve))
  try {
    return await callback(`http://127.0.0.1:${server.address().port}`)
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
}

test('liveness does not depend on MongoDB or Python availability', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/health/live`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { service: 'getemployed-api', status: 'ok' })
  })
})

test('malformed JSON is returned as a safe client error', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/jobs/saved`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' })
    const body = await response.json()
    assert.equal(response.status, 400)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.ok(body.requestId)
  })
})