import { ApolloServer } from 'apollo-server-lambda'
import { Context as LambdaContext, APIGatewayProxyEvent } from 'aws-lambda'
import resolvers from './resolvers'
import typeDefs from './typeDefs'

export type ApolloContext =  {
  context: LambdaContext,
  event: APIGatewayProxyEvent 
}

const server = new ApolloServer({
  resolvers,
  typeDefs,
  introspection: true,
  playground: true,
  defaultMaxAge: 300
})

export const handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
    allowedHeaders: '*'
  }
})