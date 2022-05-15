import {ApolloClient, InMemoryCache, gql} from '@apollo/client';
import { config } from '../state/config'

const {
  GRAPH_FACTORY_API_URL,
  GRAPH_REGISTRY_API_URL,
  VALIDATORS_API_URL
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
    putDIDs(first: 1000, where: {type_in: ["guild"]})
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
    deleteDIDs(first: 1000, where: {type_in: ["guild"]})
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

const DAO_CREATIONS = `
query {
    createDAOs(first: 1000)
    {
        event
        blockTime
        blockHeight
        contractId
        did
        summoner
        created
        status
        deposit
    }
}
`

const INACTIVATED_DAOS = `
query {
    inactivateDAOs(first: 1000)
    {
        event
        blockTime
        blockHeight
        contractId
        deactivated
        status
    }
}
`

const ALL_ALIASES = `
query{
    storeAliases(first:1000){
        aliasOwner
        alias
        definition
        description
      }
}
`

const VALIDATORS = `
query{
    stakingPools(first: 1000)
    {
        stakingPool
    }
}
`

const VALIDATOR_ACTIVITY = `
query{
    pings(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
    }
    depositAndStakes(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
    }
    deposits(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
    }
    withdrawAlls(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
    }
    withdraws(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
    }
    unstakes(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
    }
    unstakeAlls(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
    }
    stakes(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
    }
    stakeAlls(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
    }
}
`


const ACCOUNT_VALIDATOR_ACTIVITY = gql`
query account_activity($accountId: String!){
    depositAndStakes(first: 1000, where: {accountIdStaking: $accountId}) {
        id
        blockTime
        blockHeight
        totalRewardsFee
        accountIdDepositing
        deposit
        newUnstakedBalance
        accountIdStaking
        staking
        receivedStakingShares
        unstakedBalance
        stakingShares
        contractTotalStakedBalance
        contractTotalShares
    }
    deposits(first: 1000, where: {accountIdDepositing: $accountId}) {
        id
        blockTime
        blockHeight
        totalRewardsFee
        accountIdDepositing
        deposit
        newUnstakedBalance
    }
    withdrawAlls(first: 1000, where: {accountId: $accountId}) {
        id
        blockTime
        blockHeight
        accountId
        amount
        newUnstakedBalance
    }
    withdraws(first: 1000, where: {accountId: $accountId}) {
        id
        blockTime
        blockHeight
        accountId
        amount
        newUnstakedBalance
    }
    unstakeAlls(first: 1000, where: {accountId: $accountId}) {
        id
        blockTime
        blockHeight
        totalRewardsFee
        accountId
        amount
        spentStakingShareAmount
        totalUnstakedBalance
        totalStakingShares
        contractTotalStakedBalance
        contractTotalShares
    }
    unstakes(first: 1000, where: {accountId: $accountId}) {
        id
        blockTime
        blockHeight
        totalRewardsFee
        accountId
        amount
        spentStakingShareAmount
        totalUnstakedBalance
        totalStakingShares
        contractTotalStakedBalance
        contractTotalShares
    }
    stakes(first: 1000, where: {accountIdDepositing: $accountId}, or: {where: {accountIdStaking: $accountId}}){
        id
        blockTime
        blockHeight
        accountIdDepositing
        deposit
        newUnstakedBalance
        accountIdStaking
        staking
        receivedStakingShares
        unstakedBalance
        stakingShares
        contractTotalStakedBalance
        contractTotalShares
    }
    stakeAlls(first: 1000, where: {accountIdDepositing: $accountId}, or: {where: {accountIdStaking: $accountId}}){
        id
        blockTime
        blockHeight
        accountIdDepositing
        deposit
        newUnstakedBalance
        accountIdStaking
        staking
        receivedStakingShares
        unstakedBalance
        stakingShares
        contractTotalStakedBalance
        contractTotalShares
    }
}
`

const defaultOptions = {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  }

  const factoryClient = new ApolloClient({
    uri: GRAPH_FACTORY_API_URL,
    cache: new InMemoryCache(),
})

const registryClient = new ApolloClient({
    uri: GRAPH_REGISTRY_API_URL,
    cache: new InMemoryCache(),
})

const validatorClient = new ApolloClient({
    uri: VALIDATORS_API_URL,
    cache: new InMemoryCache(),
})

export default class Queries {

    async getGuilds(){
        const guilds = await registryClient.query({query: gql(GUILD_REGISTRATIONS)})
        return guilds
    }

    async getDeletedGuilds(){
        const deletedGuilds = await registryClient.query({query: gql(GUILD_DELETIONS)})
        return deletedGuilds
    }

    async getAliases(){
        const aliases = await registryClient.query({query: gql(ALL_ALIASES)})
        return aliases
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

    async getAllCommunities(){
        const allCommunities = await factoryClient.query({query: gql(DAO_CREATIONS)})
        return allCommunities
    }

    async getAllInactivatedCommunities(){
        const allInactivatedCommunities = await factoryClient.query({query: gql(INACTIVATED_DAOS)})
        return allInactivatedCommunities
    }
    
    async getValidators(){
        const validators = await validatorClient.query({query: gql(VALIDATORS)})
        return validators
    }

    async getValidatorActivity(validatorUris){
        let activity = []
       for(let x = 0; x < validatorUris.length; x++){
            let validatorClient = new ApolloClient({
                uri: validatorUris[x],
                cache: new InMemoryCache(),
            })
          
            try{
                let validatorActivity = await validatorClient.query({query: gql(VALIDATOR_ACTIVITY)})
                console.log('validatorActivity', validatorActivity)
                activity.push([validatorUris[x], validatorActivity])
            } catch (err) {
                console.log('error retrieving validator data: ', err)
            }
        }
        return activity
    }

    async getAccountValidatorActivity(validatorUris, account){
        let activity = []
       for(let x = 0; x < validatorUris.length; x++){
            let validatorClient = new ApolloClient({
                uri: validatorUris[x],
                cache: new InMemoryCache(),
            })
           
            try{
                let validatorActivity = await validatorClient.query({query: ACCOUNT_VALIDATOR_ACTIVITY, variables: {
                    accountId: account
                }})
                console.log('accountvalidatorActivity', validatorActivity)
                activity.push([validatorUris[x], validatorActivity])
            } catch (err) {
                console.log('error retrieving validator data: ', err)
            }
        }
        return activity
    }
}

export const queries = new Queries();