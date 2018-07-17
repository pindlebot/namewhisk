const fetch = require('node-fetch')
const AWS = require('aws-sdk')

const {
  DNS_SIMPLE_ENDPOINT,
  DNS_SIMPLE_TOKEN
} = process.env
const { DynamoDB } = require('aws-sdk')
const documentClient = new DynamoDB.DocumentClient({
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
          return true
        default:
          return false
      }
    })
    .catch(err => {
      console.log(err)
      return true
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
      return data.available
    })
    .catch(err => {
      console.log(err)
      return true
    })
}

const updateDomain = ({ name, tld, available }) => {
  let params = {
    id: name,
    [tld]: available,
    date: Math.floor(Date.now() / 1000)
  }
  console.log('updateDomain', params)
  return set(params).then(() => params)
}

const nativeDnsResolve = ({ name, tld }) => {
  return new Promise((resolve, reject) => {
    require('dns').resolve(`${name}.${tld}`, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(false)
      }
    })
  })
}

const fallback = async ({ name, tld }) => {
  let available
  try {
    available = await nativeDnsResolve({ name, tld })
  } catch (err) {
    available = await dnsSimple({ name, tld })
  }
  available = typeof available === 'boolean'
    ? available
    : true
  return updateDomain({ name, tld, available })
}

async function checkDomainAvailability ({ name, tld }) {
  if (tld.startsWith('.')) {
    tld = tld.slice(1, tld.length)
  }
  let domain = `${name}.${tld}`
  let data = await getDomain({ name })
  let expiry = Math.floor(Date.now() / 1000) - 24 * 60 * 60
  if ((data.date || 0) < expiry) {
    console.log('updating because data.date < expiry', { date: (data.date || 0), expiry })
    data = await fallback({ name, tld })
  }

  return {
    name,
    tld,
    domain,
    available: data[tld],
    ...data
  }
}

module.exports = checkDomainAvailability
