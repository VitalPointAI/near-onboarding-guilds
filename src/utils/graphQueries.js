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
const GUILD_REGISTRATIONS = `
query {
    putDIDs(where: {type_in: ["guild"]})
    {
        event
        blockTime
        blockHeight
        accountId
        did
        type
        registered
        owner
    }
}
`

const GUILD_DELETIONS = `
query {
    deleteDIDs(where: {type_in: ["guild"]})
    {
        event
        blockTime
        blockHeight
        accountId
        did
        type
        time
        deletedBy
    }
}
`


const INDIVIDUAL_REGISTRATIONS = `
query {
    putDIDs(where: {type_in: ["individual"]})
    {
        event
        blockTime
        blockHeight
        accountId
        did
        type
        registered
        owner
    }
}
`

const INDIVIDUAL_DELETIONS = `
query {
    deleteDIDs(where: {type_in: ["individual"]})
    {
        event
        blockTime
        blockHeight
        accountId
        did
        type
        time
        deletedBy
    }
}
`

const DATASTREAMS = `
query{
    storeAliases{
        aliasOwner
        time
        definition
        description
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

const ADD_VERIFIER_QUERY = `
query{
    addVerifiers{
        accountId
        time
        whitelistedBy
    }
}
`

const REMOVE_VERIFIER_QUERY = `
query{
    removeVerifiers{
        accountId
        time
        removedBy
    }
}
`

const VERIFIED_GUILDS = `
query{
    changeVerificationStatuses(where: {verified_in: [true]})
    {
        accountId
        time
        verified
        changedBy
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

    async getGuilds(){
        const guilds = await registryClient.query({query: gql(GUILD_REGISTRATIONS)})
        return guilds
    }

    async getDeletedGuilds(){
        const deletedGuilds = await registryClient.query({query: gql(GUILD_DELETIONS)})
        return deletedGuilds
    }

    async getIndividuals(){
        const individuals = await registryClient.query({query: gql(INDIVIDUAL_REGISTRATIONS)})
        return individuals
    }

    async getDeletedIndividuals(){
        const deletedIndividuals = await registryClient.query({query: gql(INDIVIDUAL_DELETIONS)})
        return deletedIndividuals
    }

    async getDataStreams(){
        const dataStreams = await registryClient.query({query: gql(DATASTREAMS)})
        return dataStreams
    }

    async getAddedVerifiers(){
        const verifiers = await registryClient.query({query: gql(ADD_VERIFIER_QUERY)})
        return verifiers
    }

    async getRemovedVerifiers(){
        const verifiers = await registryClient.query({query: gql(REMOVE_VERIFIER_QUERY)})
        return verifiers
    }

    async getVerifiedGuilds(){
        const verifiedGuilds = await registryClient.query({query: gql(VERIFIED_GUILDS)})
        return verifiedGuilds
    }

}

export const queries = new Queries();