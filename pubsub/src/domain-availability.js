const fetch = require('node-fetch')
const AWS = require('aws-sdk')
const whois = require('whois-2')

const {
  DNS_SIMPLE_ENDPOINT,
  DNS_SIMPLE_TOKEN
} = process.env
const documentClient = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1'
})

function get ({ id }) {
  return documentClient.get({
    TableName: 'namewhisk',
    Key: {
      id
    }
  }).promise()
}

function set ({ id, ...data }) {
  const params = {
    TableName: 'namewhisk',
    Key: {
      id: id
    },
    UpdateExpression: `set ${Object.keys(data).map(k => `#${k} = :${k}`).join(', ')}`,
    ExpressionAttributeNames: Object.keys(data).reduce((acc, key) => {
      acc['#' + key] = key
      return acc
    }, {}),
    ExpressionAttributeValues: Object.keys(data).reduce((acc, key) => {
      acc[':' + key] = data[key]
      return acc
    }, {})
  }
  return documentClient.update(params).promise()
}

const getDomain = async ({ name }) => {
  return get({ id: name })
    .then(result => result.Item)
    .then(domain => {
      console.log('getDomain', domain)
      if (typeof domain === 'undefined') {
        return {}
      }
      return domain
    })
}

const awsCheckDomainAvailability = ({ domain }) => {
  console.log('awsCheckDomainAvailability', domain)
  const Domains = new AWS.Route53Domains({ region: 'us-east-1' })
  return Domains.checkDomainAvailability({
    DomainName: domain
  }).promise()
    .then(({ Availability }) => {
      switch (Availability) {
        case 'AVAILABLE':
          return { availble: true }
        default:
          return { available: false }
      }
    })
    .catch(err => {
      console.log(err)
      return { available: true }
    })
}

const dnsSimple = ({ name, tld }) => {
  let domain = `${name}.${tld}`
  console.log('dnsSimple', domain)
  return fetch(`${DNS_SIMPLE_ENDPOINT}/${domain}/check`, {
    headers: {
      'Authorization': `Bearer ${DNS_SIMPLE_TOKEN}`
    }
  }).then(resp => resp.json())
    .then(({ data, message }) => {
      if (message || !data) {
        console.log('DNS Simple Message', message)
        return awsCheckDomainAvailability({ domain })
      }
      let { available } = data
      return { available }
    })
    .catch(err => {
      console.log(err)
      return true
    })
}

const updateDomain = (name, { tld, available, ...rest }) => {

  let params = {
    id: name,
    [tld]: {
      available,
      ...(rest || {})
    },
    date: Math.floor(Date.now() / 1000),
  }
  console.log('updateDomain', params)
  return set(params).then(() => params)
}

const fallback = async ({ name, tld }) => {
  let data = {}
  try {
    data = await whois(`${name}.${tld}`, { format: 'json' })
      .then(whoisData => {
        let data = {}
        data.available = !Object.keys(whoisData).length
        data.expiry = (whoisData.registry_expiry_date || 0)
        return data
      })
  } catch (err) {
    console.log(err)
    data = await dnsSimple({ name, tld })
  }

  return updateDomain(name, { tld, ...data })
}

const shouldFallback = ({ name, tld }, data) => {
  if (data && typeof data[tld] === 'object') {
    if (!(data[tld].expiry && data[tld].available)) {
      return true
    }
    if (data[tld].expiry) {
      let expiry = new Date(data[tld].expiry).getTime()
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

async function checkDomainAvailability ({ name, tld }) {
  if (tld.startsWith('.')) {
    tld = tld.slice(1, tld.length)
  }
  let domain = `${name}.${tld}`
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

module.exports = checkDomainAvailability
