import fetch from 'node-fetch'
import whois from 'whois-2'
import crypto from 'crypto'
import redis from 'redis'

const { REDIS_URL } = process.env
// @ts-ignore
const client = redis.createClient(REDIS_URL)

const cache = {
  get (key) {
    return new Promise((resolve, reject) => client.get(`namewhisk/${key}`, (_, data) => resolve(JSON.parse(data))))
  },
  set (key, value) {
    return new Promise(resolve => client.set(`namewhisk/${key}`, JSON.stringify(value), (_, data) => resolve(data)))
  }
}

async function get ({ id }) {
  let response

  try {
    response = await cache.get(id)
  } catch (err) {
    console.error(err)
    return null
  }

  return JSON.parse(response || '{}')
}

function set ({ id, ...data }) {
  return cache.set(id, JSON.stringify(data))
}

const getDomain = async ({ name }: { name: string }) => {
  return get(name)
    .then(domain => domain || {})
}

const updateDomain = (name: string, { tld, available, ...rest }: { tld: string, available?: boolean, expiry?: any } & { [key: string]: any }) => {
  const params = {
    id: name,
    [tld]: {
      available: Boolean(available),
      ...(rest || {})
    },
    date: Math.floor(Date.now() / 1000),
  }
  return set(params).then(() => params)
}

const fallback = async ({ name, tld }) => {
  let data = {}
  try {
    data = await whois(`${name}.${tld}`, { format: 'json' })
      .then(whoisData => {
        const data : any = {}
        data.available = !Object.keys(whoisData).length
        data.expiry = (whoisData.registry_expiry_date || 0)
        return data
      })
  } catch (err) {
    console.log(err)
  }

  return updateDomain(name, { tld, ...data })
}

const shouldFallback = ({ name, tld }, data) => {
  if (data && typeof data[tld] === 'object') {
    if (!(data[tld].expiry && data[tld].available)) {
      return true
    }
    if (data[tld].expiry) {
      const expiry = new Date(data[tld].expiry).getTime()
      if (expiry > Date.now() + 24 * 60 * 60 * 1000) {
        return false
      }
    }
    if (data[tld].available) {
      if ((data.date || 0) > Math.floor(Date.now() / 1000) - 24 * 60 * 60 * 1000) {
        return false
      }
    }
  }
  return true
}

async function checkDomainAvailability ({ name, tld }: { name: string, tld: string }) {
  if (tld.startsWith('.')) {
    tld = tld.slice(1, tld.length)
  }
  const domain = `${name}.${tld}`
  let data = await getDomain({ name })

  if (shouldFallback({ name, tld }, data)) {
    data = await fallback({ name, tld })
  }

  return {
    name,
    tld,
    domain,
    available: data[tld].available,
    ...data
  }
}

export default checkDomainAvailability
