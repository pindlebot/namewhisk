
import mqtt from 'mqtt'
import 'isomorphic-fetch'

const topics = {
  SESSION: 'namewhisk/new-session'
}

let channel

const ENDPOINT_URL = 'https://pr4yxzklrj.execute-api.us-east-1.amazonaws.com/dev/'

export default () => {
  let callback

  const connect = async () => {
    console.log(channel)
    if (channel && channel.connected) {
      return
    }

    const data = await fetch(ENDPOINT_URL).then(resp => resp.json())
    const { url, channelId } = data
    topics.CONNECTED = `namewhisk/${channelId}/connected`
    topics.REQUEST = `namewhisk/${channelId}/request`
    topics.RESPONSE = `namewhisk/${channelId}/response`
    topics.END = `namewhisk/${channelId}/end`
    channel = mqtt.connect(url)
    channel.on('error', error => console.log('WebSocket error', error))
    channel.on('offline', () => console.log('WebSocket offline'))
    channel.on('close', () => {
      console.log('CLOSED', channelId)
    })
    channel.on('end', () => {
      console.log('END', channelId)
    })
    channel.on('offline', () => {
      console.log('OFFLINE', channelId)
    })
    channel.on('reconnect', () => {
      console.log('RECONNECT', channelId)
    })
    await new Promise((resolve, reject) => channel.on('connect', resolve))
    await new Promise((resolve, reject) => channel.subscribe(topics.CONNECTED, resolve))
    await new Promise((resolve, reject) => channel.subscribe(topics.RESPONSE, resolve))
    await new Promise((resolve, reject) => channel.subscribe(topics.END, resolve))
    await new Promise((resolve, reject) => {
      channel.publish(topics.SESSION, JSON.stringify({ channelId }), { qos: 1 }, resolve)
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
    if (callback) {
      if (channel._resubscribeTopics[topics.RESPONSE] !== 0) {
        await subscribe(callback)
      }
    }
    return new Promise((resolve, reject) =>
      channel.publish(topics.REQUEST, JSON.stringify(data), resolve))
  }

  const end = () => {
    return new Promise((resolve, reject) =>
      channel.publish(topics.END, JSON.stringify({}), { qos: 0 }, () => {
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
