const fetch = require('node-fetch')
const AWS = require('aws-sdk')
const googleTrends = require('google-trends-api')
const db = require('dynamodb-tools')
  .db({ region: 'us-east-1' })
  .table('npm-available-dev-names')

const {
  WEBKNOX_API_KEY,
  DNS_SIMPLE_ENDPOINT,
  DNS_SIMPLE_TOKEN,
  GREPWORDS_API_KEY
} = process.env

const createResponse = (message = {}) => ({
  statusCode: 200,
  body: typeof message === 'string'
    ? message
    : JSON.stringify(message),
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
})

const handler = {
  suggest: ({ keyword }) => {
    return require('google-autosuggest')(keyword)
  },
  lookup: ({ keyword }) => {
    const key = GREPWORDS_API_KEY
    const url = `http://api.grepwords.com/lookup?apikey=${key}&q=${keyword}`
    return fetch(url, {
      method: 'get'
    }).then(resp => resp.json())
  },
  stats: ({ keyword }) => {
    const url = `https://webknox-keywords.p.mashape.com/keywords/${keyword}`
    return fetch(url, {
      method: 'get',
      headers: {
        'X-Mashape-Key': `${WEBKNOX_API_KEY}`,
        'Accept': 'application/json'
      }
    }).then(resp => resp.json())
  },
  trends: ({ keyword }) => {
    keyword = keyword.replace('+', ' ')
    return googleTrends.interestOverTime({ keyword: keyword })
  },
  domains: ({ name, tld }) => {
    console.log({ name, tld })
    return db.get({ id: name })
      .catch(async err => {
        if (err) console.log(err)
        // let route53 = new AWS.Route53Domains({ region: 'us-east-1' })
        // let data = await route53
        //  .checkDomainAvailability({ DomainName: `${name}.${tld}` })
        //  .promise()
        let { data } = await fetch(`${DNS_SIMPLE_ENDPOINT}/${name}.${tld}/check`, {
          headers: {
            'Authorization': `Bearer ${DNS_SIMPLE_TOKEN}`
          }
        }).then(resp => resp.json())
        let params = {
          id: name,
          [tld]: data.available,
          npm: null
        }
        console.log({ params })
        await db.set(params)
        return params
      })
  },
  synonyms: ({ word }) => {
    const url = `https://wordsapiv1.p.mashape.com/words/${word}/synonyms`
    return fetch(url, {
      method: 'get',
      headers: {
        'X-Mashape-Key': `${WEBKNOX_API_KEY}`,
        'Accept': 'application/json'
      }
    }).then(resp => resp.json())
  }
}

function endpoint (name, shouldCache = true) {
  return async function (evt, ctx, cb) {
    let { queryStringParameters } = evt
    console.log({ queryStringParameters })
    let data = {}
    try {
      data = await handler[name](queryStringParameters)
      console.log(data)
    } catch (error) {
      console.error(error)
      data = { error }
    }
    cb(null,
      createResponse(
        data
      )
    )
  }
}

module.exports.suggest = endpoint('suggest')
module.exports.lookup = endpoint('lookup')
module.exports.stats = endpoint('stats')
module.exports.trends = endpoint('trends')
module.exports.domains = endpoint('domains')
module.exports.synonyms = endpoint('synonyms')
