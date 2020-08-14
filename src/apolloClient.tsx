import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'


const httpLink = new HttpLink({ uri: 'https://l4e2iagctg.execute-api.us-east-1.amazonaws.com/prod/graphql' })
const cache = new InMemoryCache()
const client = new ApolloClient({
  link: ApolloLink.from([
    httpLink
  ]),
  // @ts-ignore
  cache: cache.restore(window.__APOLLO_STATE__),
  dataIdFromObject: object => object.id,
  connectToDevTools: true
})

export default client

