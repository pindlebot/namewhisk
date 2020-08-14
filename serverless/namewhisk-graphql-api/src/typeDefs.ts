import gql from 'graphql-tag'

const typeDefs = gql`
  scalar JSON

  type Domain {
    id: String!
    tld: String!
    name: String!
    domain: String!
    available: Boolean!
    expiry: String!
    metadata: JSON
  }

  type DomainQueryResults {
    results: [Domain!]
  }

  type Query {
    domains(name: String!, limit: Int, offset: Int, tld: String): DomainQueryResults
  }
`

export default typeDefs
