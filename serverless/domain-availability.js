const fetch = require('node-fetch')
const AWS = require('aws-sdk')
const db = require('dynamodb-tools')({ region: 'us-east-1' })
  .table('npm-available-dev-names')

const {
  DNS_SIMPLE_ENDPOINT,
  DNS_SIMPLE_TOKEN
} = process.env

const getDomain = async ({ name }) => {
  return db.get({ id: name })
    .then(result => result.Item)
}

const Domains = new AWS.Route53Domains({ region: 'us-east-1' })

const awsCheckDomainAvailability = (name) => Domains.checkDomainAvailability({
  DomainName: name
}).promise()
  .then(({ Availability }) => {
    switch (Availability) {
      case 'AVAILABLE':
        return { available: true }
      default:
        return { available: false }
    }
  })

const dnsSimpleCheckDomainAvailability = ({ name, tld }) => {
  let domain = `${name}.${tld}`
  return fetch(`${DNS_SIMPLE_ENDPOINT}/${domain}/check`, {
    headers: {
      'Authorization': `Bearer ${DNS_SIMPLE_TOKEN}`
    }
  }).then(resp => resp.json())
    .then(data => {
      if (data.message) {
        return awsCheckDomainAvailability(domain)
      }
      return data.data
    })
    .catch(err => {
      console.log(err)
      return {}
    })
}   

const updateDomain = ({ name, tld, available }) => {
  let params = {
    id: name,
    [tld]: available,
    npm: null,
    date: Math.floor(Date.now() / 1000)
  }
  return db.set(params).then(() => params)
}

const fallback = ({ name, tld }) => {
  return dnsSimpleCheckDomainAvailability({ name, tld })
    .then((data) => {
      console.log({ data })
      return updateDomain({ name, tld, available: data.available })
    })
}

module.exports = async ({ name, tld }) => {
  if (tld.startsWith('.')) {
    tld = tld.slice(1, tld.length)
  }
  if (/\./.test(name)) {
    name = name.replace(/^([^.]+)(?=\.)/, '')
  }
  let data = {}
  try {
    data = await getDomain({ name })
    let expiry = Math.floor(Date.now() / 1000) - 24 * 60 * 60
    if (!data.date || data.date < expiry || !data[tld]) {
      data = await fallback({ name, tld })
    }
  } catch (err) {
    data = await fallback({ name, tld })
  }
  console.log(data)
  return data
}
