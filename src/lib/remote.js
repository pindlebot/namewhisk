
import mqtt from 'mqtt'
import 'isomorphic-fetch'

class Remote {
  constructor (options) {
    this.options = options
    this.subscription = undefined
    this.connection = undefined
  }

  async initConnection () {
    await new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.channel) {
          this.channel.end()
        }
        reject(
          new Error(
            "Timed out after 30sec. Connection couldn't be established.",
          )
        )
      }, 30000)

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
          }
        })

        this.channel = channel

        if (this.options.debug) {
          channel.on('error', error => console.log('WebSocket error', error))
          channel.on('offline', () => console.log('WebSocket offline'))
        }

        channel.on('connect', () => {
          if (this.options.debug) {
            console.log('Connected to message broker.')
          }

          channel.subscribe(this.topics.CONNECTED, { qos: 1 }, () => {
            channel.on('message', async topic => {
              console.log(topic)
              if (this.topics.CONNECTED === topic) {
                clearTimeout(timeout)
                resolve()
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

  subscribe (update)  {
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
  }

  async publish (data) {
    if (this.subscription) {
      if (!this.channel.connected) {
        console.log('reconnecting....')
        await this.connect()
      }
    }
    return new Promise((resolve, reject) =>
      this.channel.publish(this.topics.REQUEST, JSON.stringify(data), resolve))
  }

  async connect () {
    this.connection = await this.initConnection()
    this.subscription = await new Promise((resolve, reject) =>
      this.channel.subscribe(this.topics.RESPONSE, resolve))
    return this
  }

  async close () {
    this.channel.publish(
      this.TOPIC_END,
      JSON.stringify({ channelId: this.channelId, client: true })
    )
    this.channel.on('close', () => {
      console.log('Successfully closed')
    })
    this.channel.end()
  }

  end () {
    return this.close()
  }
}

export default Remote
