
import mqtt from 'mqtt'
import 'isomorphic-fetch'
import assign from 'lodash.assign'

class Remote {
  constructor (options) {
    this.options = options
    this.connectionPromise = this.init()
    this._shouldReconnect = false
  }

  timeout () {
    return new Promise((resolve, reject) => {
      this.timerID = setTimeout(() => {
        if (this.channel) {
          this.channel.end()
        }
        reject(
          new Error(
            "Timed out after 30sec. Connection couldn't be established.",
          )
        )
      }, 30000)
    })
  }

  init () {
    return new Promise(async (resolve, reject) => {
      this.timeout().catch(reject)

      try {
        const { endpointUrl } = this.options
        const data = await fetch(endpointUrl).then(resp => resp.json())
        const { url, channelId } = data
        this.channelId = channelId
        this.topics = {
          NEW_SESSION: `namewhisk/new-session`,
          CONNECTED: `namewhisk/${channelId}/connected`,
          REQUEST: `namewhisk/${channelId}/request`,
          RESPONSE: `namewhisk/${channelId}/response`,
          END: `namewhisk/${channelId}/end`
        }
        const channel = mqtt.connect(url, {
          will: {
            topic: 'namewhisk/last-will',
            payload: JSON.stringify({ channelId }),
            qos: 1,
            retain: false
          },
          resubscribe: true
        })

        this.channel = channel

        if (this.options.debug) {
          this.log()
        }

        channel.on('connect', async () => {
          channel.subscribe(this.topics.CONNECTED, { qos: 1 }, () => {
            channel.on('message', async topic => {
              console.log(topic)
              if (this.topics.CONNECTED === topic) {
                clearTimeout(this.timerID)
                channel.subscribe(this.topics.RESPONSE, () => resolve(true))
              }
            })

            channel.publish(
              this.topics.NEW_SESSION,
              JSON.stringify({ channelId, options: this.options }),
              { qos: 1 }
            )
          })

          channel.subscribe(this.topics.END, () => {
            channel.on('message', async (topic, buffer) => {
              if (this.topics.END === topic) {
                const message = buffer.toString()
                const data = JSON.parse(message)

                if (data.outOfTime) {
                  console.warn(
                    `Proxy disconnected because it reached it's execution time limit (5 minutes).`
                  )
                } else if (data.inactivity) {
                  console.warn(
                    'Proxy disconnected due to inactivity (no commands sent for 30 seconds).'
                  )
                } else {
                  console.warn(
                    `Proxy disconnected (we don't know why).`,
                    data
                  )
                }
                await this.close()
              }
            })
          })
        })
      } catch (error) {
        console.error(error)

        reject(
          new Error('Unable to get presigned websocket URL and connect to it.')
        )
      }
    })
  }

  subscribe (update) {
    console.log('subscribing')
    this._update = update
    this.channel.on('message', (topic, buffer) => {
      console.log(buffer.toString())
      if (this.topics.RESPONSE === topic) {
        const message = buffer.toString()
        const result = JSON.parse(message)

        if (result.error) {
          update(result.error)
        } else if (result.value) {
          update(result.value)
        } else {
          update()
        }
      }
    })
    return this
  }

  async connectIfNeeded () {
    if (this.channel) {
      if (!this.channel.connected || this.channel.disconnecting) {
        this._shouldReconnect = true
        return new Promise((resolve, reject) =>
          setTimeout(async () => {
            await this.connectionPromise
            this.subscribe(this._update)
            resolve()
          }, 1000))
      }
    }
    return this.connectionPromise
  }

  async publish (data) {
    await this.connectIfNeeded()
    console.log('publishing', data)
    return new Promise((resolve, reject) =>
      this.channel.publish(this.topics.REQUEST, JSON.stringify(data), resolve))
  }

  log () {
    this.channel.on('error', error => console.log('WebSocket error', error))
    this.channel.on('offline', () => console.log('WebSocket offline'))
    this.channel.on('close', () => {
      console.log('CLOSED', this.channelId)
    })
    this.channel.on('end', () => {
      console.log('END', this.channelId)
    })
    this.channel.on('offline', () => {
      console.log('OFFLINE', this.channelId)
    })
    this.channel.on('reconnect', () => {
      console.log('RECONNECT', this.channelId)
    })
  }

  async close () {
    this._shouldReconnect = false
    console.log('Closing connection...')
    this.channel.publish(
      this.TOPIC_END,
      JSON.stringify({ channelId: this.channelId, client: true })
    )
    this.channel.end(async () => {
      while (this._shouldReconnect) {
        await new Promise((resolve, reject) => setTimeout(resolve, 100))
      }
      this.connectionPromise = await this.init()
      this._shouldReconnect = false
    })
  }

  end () {
    return this.close()
  }
}

export default Remote
