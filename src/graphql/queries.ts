import gql from 'graphql-tag'

export const DOMAINS_QUERY = gql`
  query ($name: String!, $limit: Int, $offset: Int, $tld: String) {
    domains (name: $name, limit: $limit, offset: $offset, tld: $tld) {
      results {
        id
        metadata
        tld
        name
        domain
        available
        expiry
      }
    }
  }
`