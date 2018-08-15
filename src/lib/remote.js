
import mqtt from 'mqtt'
import 'isomorphic-fetch'
import cuid from 'cuid'

const ENDPOINT_URL = 'https://pr4yxzklrj.execute-api.us-east-1.amazonaws.com/dev/'

const TOPIC_SESSION = 'namewhisk/new-session'

class Channel {
  constructor (channel) {
    this.channelId = cuid()
    this.topics = {}
    this.topics.CONNECTED = `namewhisk/${this.channelId}/connected`
    this.topics.REQUEST = `namewhisk/${this.channelId}/request`
    this.topics.RESPONSE = `namewhisk/${this.channelId}/response`
    this.topics.END = `namewhisk/${this.channelId}/end`
    this.channel = channel
  }
}

export default () => {
  let callback
  const topics = {}
  let channel
  let channelId

  const event = (event) =>
    new Promise((resolve, reject) => channel.on(event, (data) => {
      console.log(event, data)
      resolve(data)
    }))

  const unsubscribe = () =>
    new Promise((resolve, reject) => channel.unsubscribe(Object.values(topics), resolve))

  const _subscribe = () =>
    new Promise((resolve, reject) => channel.subscribe(Object.values(topics), () => {
      console.log(`Subscribed to topics ${Object.values(topics).join(', ')}`)
      resolve()
    }))

  const setTopics = () => {
    topics.CONNECTED = `namewhisk/${channelId}/connected`
    topics.REQUEST = `namewhisk/${channelId}/request`
    topics.RESPONSE = `namewhisk/${channelId}/response`
    topics.END = `namewhisk/${channelId}/end`
  }

  const connect = async () => {
    if (channel) {
      if (channel.connected || channel.connecting) {
        return
      } else {
        channelId = cuid()
        setTopics()
        channel.reconnect({ resubscribe: false })
        await event('connect')
      }
    } else {
      const data = await fetch(ENDPOINT_URL).then(resp => resp.json())
      channelId = data.channelId
      setTopics()
      channel = mqtt.connect(data.url, { resubscribe: false })
      await event('connect')
    }
    channel.on('error', error => console.log('WebSocket error', error))
    channel.on('offline', () => console.log('WebSocket offline'))
    channel.on('close', () => console.log('CLOSED', channelId))
    channel.on('end', () => console.log('END', channelId))
    channel.on('offline', () => console.log('OFFLINE', channelId))
    channel.on('reconnect', () => console.log('RECONNECT', channelId))

    await _subscribe()
    await new Promise((resolve, reject) => {
      channel.publish(TOPIC_SESSION, JSON.stringify({ channelId }), { qos: 1 }, () => {
        console.log(`Subcribed to ${TOPIC_SESSION}`)
        resolve()
      })
    })

    return new Promise((resolve, reject) =>
      channel.on('message', (topic, message) => {
        if (topic === topics.CONNECTED) {
          resolve()
        }
      })
    )
  }

  const subscribe = async (update) => {
    callback = update
    await connect()
    channel.on('message', (topic, buffer) => {
      console.log({ topic, message: buffer.toString() })
      if (topics.RESPONSE === topic) {
        const message = buffer.toString()
        const result = JSON.parse(message)

        if (result.error) {
          callback(result.error)
        } else if (result.value) {
          callback(result.value)
        } else {
          callback()
        }
      }

      if (topics.END === topic) {
        channel.end()
      }
    })
  }

  const publish = async (data) => {
    await connect()
    console.log(channel)

    return new Promise((resolve, reject) =>
      channel.publish(topics.REQUEST, JSON.stringify(data), resolve))
  }

  const end = () => {
    return new Promise((resolve, reject) =>
      channel.publish(topics.END, JSON.stringify({}), { qos: 0 }, async () => {
        await unsubscribe()
        channel.end(resolve)
      })
    )
  }

  return {
    subscribe,
    publish,
    end
  }
}
