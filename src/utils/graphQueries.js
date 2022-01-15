import {ApolloClient, InMemoryCache, gql} from '@apollo/client';
import { config } from '../state/config'

const {
  GRAPH_FACTORY_API_URL,
  GRAPH_REGISTRY_API_URL,
} = config

const FACTORY_QUERY=`
    query{
        logs(first: 1000, orderBy: created, orderDirection:desc, where: {event_in: ["createDAO"]}) {
            id
            standard
            version
            event
            created
            contractId
            did
            status
            deposit
            summoner
        }
    }
`
const REGISTRY_QUERY = `
query{
    accounts{
        id
        log
    }
}
`

const factoryClient = new ApolloClient({
    uri: GRAPH_FACTORY_API_URL,
    cache: new InMemoryCache(),
})

const registryClient = new ApolloClient({
    uri: GRAPH_REGISTRY_API_URL,
    cache: new InMemoryCache(),
})
    

export default class Queries {

    async getCommunities(){
        const communities = await factoryClient.query({query: gql(FACTORY_QUERY)})
        return communities
    }

}

export const queries = new Queries();