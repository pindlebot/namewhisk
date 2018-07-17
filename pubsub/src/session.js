const cuid = require('cuid')
const { createPresignedURL } = require('./utils')

module.exports.handler = async (event, context, callback) => {
  const url = createPresignedURL()
  const channelId = cuid()

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ url, channelId }),
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  })
}
