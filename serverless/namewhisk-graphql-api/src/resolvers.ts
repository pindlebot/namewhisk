import namist from 'namist'
import dataset from 'prefix-suffix'
import whois from 'whois-2'
import crypto from 'crypto'
import GraphQLJSON from 'graphql-type-json'
import { request, gql } from 'graphql-request'

export function getNames ({ limit, offset, name }) {
  const options = { limit, offset }
  if (offset > namist.HEADS.length) {
    // @ts-ignore
    (options as any).heads = dataset.suffixes.map(v => v[0])
    // @ts-ignore
    (options as any).modifiers = dataset.prefixes.map(v => v[0])
  }
  const data = namist(name, options)
    .map(name => name.toLowerCase())
  return data
}

async function checkDomainAvailability ({ name, tld }) {
  const domain = `${name}.${tld}`
  const metadata = await whois(domain, { format: 'json' })
  const available = !Object.keys(metadata).length
  const expiry = (metadata.registry_expiry_date || 0)
  const id = crypto.createHash('md5').update(domain).digest('hex')

  return {
    id,
    tld,
    name,
    domain,
    available,
    expiry,
    metadata
  }
}

async function checkUsernameAvailability ({ name }) {
  // query {
  //   user(login:"fsdfsdfs") {
  //     id
  //   }
  //   rateLimit {
  //     nodeCount
  //   }
  // }
}

export default {
  Query: {
    domains: async (parent, variables, context) => {
      const { name, limit = 10, offset = 0, tld = 'io' } = variables
      const variations = await getNames({ limit, offset, name })
      const results = await Promise.all(
        variations.map(variation => checkDomainAvailability({ name: variation, tld }))
      )
      return { results }
    },
    usernames: async (parent, variables, context) => {
      const { name, limit = 10, offset = 0 } = variables
      const variations = await getNames({ limit, offset, name })
      const results = await Promise.all(
        variations.map(variation => checkUsernameAvailability({ name: variation, tld }))
      )
      return { results }
    }
  },
  JSON: GraphQLJSON
}