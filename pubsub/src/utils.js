const aws4 = require('aws4')

function createPresignedURL (
  {
    host = process.env.AWS_IOT_HOST,
    path = '/mqtt',
    region = process.env.AWS_REGION,
    service = 'iotdevicegateway',
    accessKeyId = process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken = process.env.AWS_SESSION_TOKEN
    // expires = 0, // @TODO: 300, check if this is working http://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
  } = {}
) {
  const signed = aws4.sign(
    {
      host,
      path,
      service,
      region,
      signQuery: true
      // headers: {
      //   'X-Amz-Expires': expires,
      // },
    },
    {
      accessKeyId,
      secretAccessKey
    }
  )

  return `wss://${host}${signed.path}&X-Amz-Security-Token=${encodeURIComponent(
    sessionToken
  )}`
}

function debug (...log) {
  console.log(
    ...log.map(
      argument =>
        typeof argument === 'object'
          ? JSON.stringify(argument, null, 2)
          : argument
    )
  )
}

function getNames ({ limit, offset, name }) {
  const namist = require('namist')
  const options = { limit, offset }
  if (offset > namist.HEADS.length) {
    const dataset = require('prefix-suffix')
    options.heads = dataset.suffixes.map(v => v[0])
    options.modifiers = dataset.prefixes.map(v => v[0])
  }
  const data = namist(name, options)
    .map(name => name.toLowerCase())
  return data
}

const connect = ({ channel }) =>
  new Promise((resolve, reject) => channel.on('connect', resolve))

const subscribe = ({ channel, topic }) =>
  new Promise((resolve, reject) => channel.subscribe(topic,
    () => {
      console.log(`subscribed to topic "${topic}"`)
      resolve()
    })
  )

module.exports.createPresignedURL = createPresignedURL
module.exports.debug = debug
module.exports.getNames = getNames
module.exports.connect = connect
module.exports.subscribe = subscribe
