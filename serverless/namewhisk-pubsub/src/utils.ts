import aws4 from 'aws4'

export function createPresignedURL (
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

export function debug (...log) {
  console.log(
    ...log.map(
      argument =>
        typeof argument === 'object'
          ? JSON.stringify(argument, null, 2)
          : argument
    )
  )
}

export function getNames ({ limit, offset, name }) {
  const namist = require('namist')
  const options = { limit, offset }
  if (offset > namist.HEADS.length) {
    const dataset = require('prefix-suffix')
    // @ts-ignore
    (options as any).heads = dataset.suffixes.map(v => v[0])
    // @ts-ignore
    (options as any).modifiers = dataset.prefixes.map(v => v[0])
  }
  const data = namist(name, options)
    .map(name => name.toLowerCase())
  return data
}

export const connect = ({ channel }) =>
  new Promise((resolve, reject) => channel.on('connect', resolve))

export const subscribe = ({ channel, topic }) =>
  new Promise((resolve, reject) => channel.subscribe(topic,
    () => {
      console.log(`subscribed to topic "${topic}"`)
      resolve()
    })
  )

