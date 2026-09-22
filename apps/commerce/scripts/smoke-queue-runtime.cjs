'use strict'
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
const { createRequire } = require('node:module')
const fs = require('node:fs')
const { Queue, Worker, QueueEvents } = require('bullmq')
const Redis = require('ioredis')

;(async () => {
  const database = new URL(process.env.DATABASE_URL || 'invalid:')
  const redisUrl = new URL(process.env.REDIS_URL || 'invalid:')
  if (process.env.APP_ENV !== 'test' || database.pathname !== '/vintage_ci' || !['localhost','127.0.0.1','postgres'].includes(database.hostname) || !['localhost','127.0.0.1','redis'].includes(redisUrl.hostname)) throw new Error('Queue regression requires isolated CI infrastructure')
  const fromBull = createRequire(require.resolve('bullmq/package.json'))
  const uuid = fromBull('uuid')
  assert.equal(require('bullmq/package.json').version, '5.13.0')
  assert.equal(fromBull('uuid/package.json').version, '11.1.1')
  assert.match(uuid.v4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  assert.throws(() => uuid.v5('QA', uuid.v5.DNS, new Uint8Array(8), 0), RangeError)
  const name = 'vintage-uuid-qa-' + randomUUID()
  const connection = new Redis(process.env.REDIS_URL, {maxRetriesPerRequest:null, connectTimeout:3000})
  const workerConnection = connection.duplicate()
  const eventConnection = connection.duplicate()
  const queue = new Queue(name, {connection})
  const events = new QueueEvents(name, {connection:eventConnection})
  const errors = [], executions = {retry:0, delayed:0}
  let worker
  events.on('error', error => errors.push(error.message))
  try {
    await events.waitUntilReady()
    const first = await queue.add('retry', {synthetic:true}, {jobId:'same-command', attempts:2, backoff:{type:'exponential', delay:30}})
    const replay = await queue.add('retry', {synthetic:true}, {jobId:'same-command', attempts:2})
    assert.equal(first.id, replay.id)
    worker = new Worker(name, async job => {
      executions[job.name]++
      if (job.name === 'retry' && executions.retry === 1) throw new Error('QA injected first-attempt failure')
      return {synthetic:true, completed:true}
    }, {connection:workerConnection, concurrency:1})
    worker.on('error', error => errors.push(error.message))
    await worker.waitUntilReady()
    assert.equal((await first.waitUntilFinished(events, 15000)).completed, true)
    const delayed = await queue.add('delayed', {synthetic:true}, {delay:50})
    assert.equal((await delayed.waitUntilFinished(events, 15000)).completed, true)
    assert.equal(executions.retry, 2)
    assert.equal(executions.delayed, 1)
    assert.equal(await queue.getCompletedCount(), 2)
    assert.equal(await queue.getFailedCount(), 0)
    assert.deepEqual(errors, [])
    fs.mkdirSync('.cache', {recursive:true})
    fs.writeFileSync('.cache/queue-runtime-report.json', JSON.stringify({scope:'isolated_BullMQ_5.13.0_UUID_11.1.1', checks:['CommonJS_resolution','UUID_v4_generation','UUID_v5_bounds_check','job_id_deduplication','failed_job_retry','delayed_job','completion_events'], executions, errors},null,2)+'\n')
    console.log('QUEUE_RUNTIME_PASS: patched UUID resolution, duplicate job ID, retry, delayed job and completion events')
  } finally {
    if (worker) await worker.close()
    await events.close()
    await queue.obliterate({force:true})
    await queue.close()
    await Promise.all([connection.quit(),workerConnection.quit(),eventConnection.quit()])
  }
})().catch(error => { console.error(error); process.exit(1) })
