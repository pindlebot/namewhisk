const AWS = require('aws-sdk')
const { debug } = require('./utils')

const iotData = new AWS.IotData({ endpoint: process.env.AWS_IOT_HOST })

module.exports.handler = async ({ channelId }, context, callback) => {
  debug('Disconnect on', channelId)

  let params = {
    topic: `namewhisk/${channelId}/end`,
    payload: JSON.stringify({ channelId, client: true, disconnected: true }),
    qos: 1
  }

  iotData.publish(params, callback)
}
