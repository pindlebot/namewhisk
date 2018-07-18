const { promisify } = require('util')
const fetch = require('node-fetch')

const testConnection = () => {
  return fetch('https://www.google.com')
    .then(resp => resp.status)
}
const createClient = async () => {
  const client = require('redis')
    .createClient({ port: 6379, host: process.env.cacheUrl })
  client.on('error', (err) => {
    console.log(err)
  })
  await new Promise((resolve, reject) =>
    client.on('ready', resolve)
  )
  client.on('error', () => console.log('error'))
  client.on('connect', () => console.log('connect'))
  client.on('end', () => console.log('end'))
  return {
    get: promisify(client.get).bind(client),
    set: promisify(client.set).bind(client),
    end: () => new Promise((resolve, reject) => {
      client.on('end', resolve)
      client.quit()
    })
  }
}

const respond = (message = {}) => ({
  statusCode: 200,
  body: typeof message === 'string'
    ? message
    : JSON.stringify(message),
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
})

module.exports.get = async (event, context, callback) => {
  const client = await createClient()
  const { id } = (event && event.pathParameters) || {}
  if (!id) {
    return callback(null, respond({ error: 'missing parameter id' }))
  }

  let data = await client.get(id)
  if (data) {
    data = JSON.parse(data)
  }

  let status = await testConnection()
  console.log({ status })

  await client.end()
  callback(
    null,
    respond({ data })
  )
}

module.exports.post = async (event, context, callback) => {
  const client = await createClient()
  const { id } = (event && event.pathParameters) || {}
  console.log(event)
  if (!id) {
    return callback(
      null,
      respond({ error: 'missing parameter id' })
    )
  }

  let data = JSON.parse(event.body)
  await client.set(id, JSON.stringify(data))

  await client.end()
  callback(
    null,
    respond({ data })
  )
}
