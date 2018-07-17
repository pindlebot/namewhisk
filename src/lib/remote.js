
import mqtt from 'mqtt'
import 'isomorphic-fetch'

class Remote {
  constructor (options) {
    this.options = options
    this.connection = this.initConnection()
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
        const { endpointUrl, apiKey } = this.options.remote
        const data = await fetch(endpointUrl).then(resp => resp.json())
        const { url, channelId } = data
        this.channelId = channelId
        this.TOPIC_NEW_SESSION = `namewhisk/new-session`
        this.TOPIC_CONNECTED = `namewhisk/${channelId}/connected`
        this.TOPIC_REQUEST = `namewhisk/${channelId}/request`
        this.TOPIC_RESPONSE = `namewhisk/${channelId}/response`
        this.TOPIC_END = `namewhisk/${channelId}/end`
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

          channel.subscribe(this.TOPIC_CONNECTED, { qos: 1 }, () => {
            channel.on('message', async topic => {
              console.log(topic)
              if (this.TOPIC_CONNECTED === topic) {
                clearTimeout(timeout)
                resolve()
              }
            })

            channel.publish(
              this.TOPIC_NEW_SESSION,
              JSON.stringify({ channelId, options: this.options }),
              { qos: 1 }
            )
          })

          channel.subscribe(this.TOPIC_END, () => {
            channel.on('message', async (topic, buffer) => {
              if (this.TOPIC_END === topic) {
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

  async process (command) {
    await this.connection

    if (this.options.debug) {
      console.log(`Running remotely: ${JSON.stringify(command)}`)
    }

    const promise = new Promise((resolve, reject) => {
      this.channel.subscribe(this.TOPIC_RESPONSE, () => {
        this.channel.on('message', (topic, buffer) => {
          console.log(buffer.toString())
          if (this.TOPIC_RESPONSE === topic) {
            const message = buffer.toString()
            const result = JSON.parse(message)

            if (result.error) {
              reject(result.error)
            } else if (result.value) {
              resolve(result.value)
            } else {
              resolve()
            }
          }
        })
        this.channel.publish(this.TOPIC_REQUEST, JSON.stringify(command))
      })
    })

    return promise
  }

  async close () {
    this.channel.publish(
      this.TOPIC_END,
      JSON.stringify({ channelId: this.channelId, client: true }),
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
