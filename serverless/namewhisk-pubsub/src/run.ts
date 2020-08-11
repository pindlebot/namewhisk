import mqtt from 'mqtt'
import {
  createPresignedURL,
  getNames,
  connect,
  subscribe
} from './utils'
import domainAvailability from './domain-availability'

const topics : any = {}
let channel : mqtt.Client

const handleMessage = async ({ topic, buffer }) => {
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
  data = data.filter(domain => domain[domain.tld].available)
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

export const handler = async (
  { channelId, options },
  context,
  callback
) => {
  let endingInvocation = false
  let timeout
  let executionCheckInterval
  let resolveExecution
  let promise = new Promise((resolve, reject) => {
    resolveExecution = resolve
  })
  console.log('Invoked with data: ', channelId, options)

  topics.CONNECTED = `namewhisk/${channelId}/connected`
  topics.REQUEST = `namewhisk/${channelId}/request`
  topics.RESPONSE = `namewhisk/${channelId}/response`
  topics.END = `namewhisk/${channelId}/end`

  channel = mqtt.connect(createPresignedURL())
  channel.on('error', error => console.log('WebSocket error', error))
  channel.on('offline', () => console.log('WebSocket offline'))

  const end = (topicEndData = {}) => {
    if (!endingInvocation) {
      endingInvocation = true
      clearInterval(executionCheckInterval)
      clearTimeout(timeout)

      channel.unsubscribe(topics.END, () => {
        channel.publish(topics.END, JSON.stringify({
          channelId,
          ...topicEndData
        }), {
          qos: 0
        }, () => {
          channel.end(resolveExecution)
        })
      })
    }
  }

  const newTimeout = () =>
    setTimeout(() => {
      console.log('Timing out. No requests received for 30 seconds.')
      end({ inactivity: true })
    }, 30000)

  executionCheckInterval = setInterval(async () => {
    let remaining = context.getRemainingTimeInMillis()
    if (remaining < 5000) {
      console.log('Ran out of execution time.')
      end({ outOfTime: true })
    }
  }, 1000)

  await connect({ channel })

  console.log('Connected to AWS IoT broker')
  await subscribe({ channel, topic: topics.REQUEST })
  await subscribe({ channel, topic: topics.END })

  channel.publish(topics.CONNECTED, JSON.stringify({}), {
    qos: 1
  })

  timeout = newTimeout()
  channel.on('message', async (topic, buffer) => {
    if (topic === topics.REQUEST) {
      if (!endingInvocation) {
        clearTimeout(timeout)
        timeout = newTimeout()
        await handleMessage({ topic, buffer })
      }
    }

    if (topic === topics.END) {
      const message = buffer.toString()
      const data = JSON.parse(message)
      console.log(`Message from ${topics.END}`, message)
      console.log(
        `Client ${data.disconnected ? 'disconnected' : 'ended session'}.`
      )
      end()
      console.log('Ended successfully.')
    }
  })
  await promise.then(() => callback(null))
}
