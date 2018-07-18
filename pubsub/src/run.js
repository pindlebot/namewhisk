const mqtt = require('mqtt')
const {
  createPresignedURL,
  getNames,
  connect,
  subscribe
} = require('./utils')
const domainAvailability = require('./domain-availability')

const createHandler = ({ channel, topics }) => async ({ topic, buffer }) => {
  const message = buffer.toString()
  console.log(`Message from ${topics.REQUEST}`, message)
  const {
    name,
    limit,
    offset,
    tld,
    mode = 'whimsical'
  } = JSON.parse(message)

  let names

  if (mode === 'whimsical') {
    names = getNames({ name, limit, offset })
  } else {
    names = await require('google-autosuggest')(name)
      .then(data => data.set.map(({ value }) => value.replace(/\s/g, '')))
    names = names.filter(w => /^[A-Za-z0-8-]+$/.test(w))
  }

  let promises = names.map(name => domainAvailability({ name, tld }))
  let data = await Promise.all(promises)
  data = data.filter(domain => domain.available)
  try {
    await new Promise((resolve, reject) =>
      channel.publish(
        topics.RESPONSE,
        JSON.stringify({ value: data }),
        { qos: 1 },
        resolve
      )
    )
  } catch (error) {
    const remoteResult = JSON.stringify({
      error: error.toString()
    })

    console.log('Namewhisk error', error)
    await new Promise((resolve, reject) =>
      channel.publish(topics.RESPONSE, remoteResult, {
        qos: 1
      }, resolve)
    )
  }
}

module.exports.handler = async (
  { channelId, options },
  context,
  callback
) => {
  let endingInvocation = false
  let timeout
  let executionCheckInterval
  let endPromise
  console.log('Invoked with data: ', channelId, options)

  const topics = {
    CONNECTED: `namewhisk/${channelId}/connected`,
    REQUEST: `namewhisk/${channelId}/request`,
    RESPONSE: `namewhisk/${channelId}/response`,
    END: `namewhisk/${channelId}/end`
  }

  const channel = mqtt.connect(createPresignedURL())
  channel.on('error', error => console.log('WebSocket error', error))
  channel.on('offline', () => console.log('WebSocket offline'))
  const handleMessage = createHandler({ channel, topics })

  const end = (topicEndData = {}) => {
    endPromise = new Promise((resolve, reject) => {
      if (!endingInvocation) {
        endingInvocation = true
        clearInterval(executionCheckInterval)
        clearTimeout(timeout)

        channel.unsubscribe(topics.END, () => {
          channel.publish(topics.END, JSON.stringify({
            channelId,
            chrome: true,
            ...topicEndData
          }), {
            qos: 0
          }, async () => {
            channel.end(() => {
              resolve(callback())
            })
          })
        })
      }
    })
    return endPromise
  }

  const newTimeout = () => {
    return setTimeout(
      async () => {
        console.log('Timing out. No requests received for 30 seconds.')
        await end({
          inactivity: true
        })
      }, 30000)
  }

  executionCheckInterval = setInterval(async () => {
    let remaining = context.getRemainingTimeInMillis()
    if (remaining < 5000) {
      console.log('Ran out of execution time.')
      await end({
        outOfTime: true
      })
    }
  }, 1000)

  await connect({ channel })

  console.log('Connected to AWS IoT broker')

  channel.publish(topics.CONNECTED, JSON.stringify({}), {
    qos: 1
  })

  await subscribe({ channel, topic: topics.REQUEST })
  await subscribe({ channel, topic: topics.END })

  const queue = []
  let listener
  timeout = newTimeout()

  const waitForMessages = () => new Promise(async (resolve, reject) => {
    if (!listener) {
      listener = channel.on('message', async (topic, buffer) => {
        switch (topic) {
          case topics.REQUEST:
            if (!endingInvocation) {
              let promise = handleMessage({ topic, buffer })
              queue.push(promise)
            }
            break
          case topics.END:
            const message = buffer.toString()
            const data = JSON.parse(message)
            console.log(`Message from ${topics.END}`, message)
            console.log(
              `Client ${data.disconnected ? 'disconnected' : 'ended session'}.`
            )
            await end()
            console.log('Ended successfully.')
        }
      })
    }

    if (queue.length) {
      clearTimeout(timeout)
      await queue.shift()
      timeout = newTimeout()
      return resolve()
    }
    resolve(
      new Promise((resolve, reject) =>
        setTimeout(() => {
          resolve()
        }, 0)
      )
    )
  })

  while (true) {
    if (endingInvocation) {
      await endPromise
      break
    }
    await waitForMessages()
  }
}
