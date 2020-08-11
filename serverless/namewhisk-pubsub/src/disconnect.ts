import AWS from 'aws-sdk'
import { debug } from './utils'

const iotData = new AWS.IotData({ endpoint: process.env.AWS_IOT_HOST })

export const handler = async ({ channelId }, context, callback) => {
  debug('Disconnect on', channelId)

  let params = {
    topic: `namewhisk/${channelId}/end`,
    payload: JSON.stringify({ channelId, client: true, disconnected: true }),
    qos: 1
  }

  iotData.publish(params, callback)
}
