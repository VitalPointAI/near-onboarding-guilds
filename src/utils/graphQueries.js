import {ApolloClient, InMemoryCache, gql} from '@apollo/client';
import { sliderClasses } from '@mui/material';
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

// const VALIDATOR_ACTIVITY = gql`
// query executor_activity($executorId: String!){
//     pings(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
//         blockHeight
//         blockTime
//         epoch
//         rewardsReceived
//         newContractStakedBalance
//         newContractTotalShares
//     }
//     depositAndStakes(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
//         blockHeight
//         blockTime
//         epoch
//         rewardsReceived
//         newContractStakedBalance
//         newContractTotalShares
//     }
//     deposits(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
//         blockHeight
//         blockTime
//         epoch
//         rewardsReceived
//         newContractStakedBalance
//         newContractTotalShares
//     }
//     withdrawAlls(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
//         blockHeight
//         blockTime
//         epoch
//         rewardsReceived
//         newContractStakedBalance
//         newContractTotalShares
//     }
//     withdraws(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
//         blockHeight
//         blockTime
//         epoch
//         rewardsReceived
//         newContractStakedBalance
//         newContractTotalShares
//     }
//     unstakes(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
//         blockHeight
//         blockTime
//         epoch
//         rewardsReceived
//         newContractStakedBalance
//         newContractTotalShares
//     }
//     unstakeAlls(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
//         blockHeight
//         blockTime
//         epoch
//         rewardsReceived
//         newContractStakedBalance
//         newContractTotalShares
//     }
//     stakes(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
//         blockHeight
//         blockTime
//         epoch
//         rewardsReceived
//         newContractStakedBalance
//         newContractTotalShares
//     }
//     stakeAlls(first: 1000, orderBy: epoch, orderDirection: asc, where: {epoch_not: null}){
//         blockHeight
//         blockTime
//         epoch
//         rewardsReceived
//         newContractStakedBalance
//         newContractTotalShares
//     }
// }
// `

const VALIDATOR_ACTIVITY = gql`
query executor_activity(
    $executorId: String!, 
    $pingsBlockTime: String!,
    $depositAndStakesBlockTime: String!,
    $depositsBlockTime: String!,
    $withdrawAllsBlockTime: String!,
    $withdrawsBlockTime: String!,
    $unstakesBlockTime: String!,
    $unstakeAllsBlockTime: String!,
    $stakesBlockTime: String!,
    $stakeAllsBlockTime: String!
    ){
    pings(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId}, and: {where: {blockTime_gt: $pingsBlockTime}}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
        executorId
    }
    depositAndStakes(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId}, and: {where: {blockTime_gt: $depositAndStakesBlockTime}}){
        blockHeight
        blockTime
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
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
        executorId
    }
    deposits(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId}, and: {where: {blockTime_gt: $depositsBlockTime}}){
        blockHeight
        blockTime
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
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
        executorId
    }
    withdrawAlls(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId}, and: {where: {blockTime_gt: $withdrawAllsBlockTime}}){
        blockHeight
        blockTime
        amount
        newUnstakedBalance
        executorId
    }
    withdraws(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId}, and: {where: {blockTime_gt: $withdrawsBlockTime}}){
        blockHeight
        blockTime
        amount
        newUnstakedBalance
        executorId
    }
    unstakes(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId}, and: {where: {blockTime_gt: $unstakesBlockTime}}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
        executorId
    }
    unstakeAlls(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId}, and: {where: {blockTime_gt: $unstakeAllsBlockTime}}){
        blockHeight
        blockTime
        amount
        spentStakingShareAmount
        totalUnstakedBalance
        totalStakingShares
        contractTotalStakedBalance
        contractTotalShares
        executorId
    }
    stakes(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId}, and: {where: {blockTime_gt: $stakesBlockTime}}){
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
        executorId
    }
    stakeAlls(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId}, and: {where: {blockTime_gt: $stakeAllsBlockTime}}){   
        blockHeight
        blockTime
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
        executorId
    }
}
`


const ACCOUNT_VALIDATOR_ACTIVITY = gql`
query account_activity($accountId: String!){
    depositAndStakes(first: 1000, where: {accountIdStaking: $accountId} ) {
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
        executorId
    }
    deposits(first: 1000, where: {accountIdDepositing: $accountId}) {
        id
        blockTime
        blockHeight
        totalRewardsFee
        accountIdDepositing
        deposit
        newUnstakedBalance
        executorId
    }
    withdrawAlls(first: 1000, where: {accountId: $accountId}) {
        id
        blockTime
        blockHeight
        accountId
        amount
        newUnstakedBalance
        executorId
    }
    withdraws(first: 1000, where: {accountId: $accountId}) {
        id
        blockTime
        blockHeight
        accountId
        amount
        newUnstakedBalance
        executorId
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
        executorId
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
        executorId
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
        executorId
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
        executorId
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

    async getValidatorActivity(validators){
        let activity = [] 

        // start blocktimes Oct 1 2020 (around start of mainnet)
        let pingsBlockTime = '1604271586000'
        let depositAndStakesBlockTime = '1604271586000'
        let depositsBlockTime = '1604271586000'
        let withdrawAllsBlockTime = '1604271586000'
        let withdrawsBlockTime = '1604271586000'
        let unstakeAllsBlockTime = '1604271586000'
        let unstakesBlockTime = '1604271586000'
        let stakesBlockTime = '1604271586000'
        let stakeAllsBlockTime = '1604271586000'
        
        let keepRunning = true
        let depositAndStakesKeepRunning = true
        let depositsKeepRunning = true
        let pingsKeepRunning = true
        let stakeAllsKeepRunning = true
        let stakesKeepRunning = true
        let unstakeAllsKeepRunning = true
        let unstakesKeepRunning = true
        let withdrawAllsKeepRunning = true
        let withdrawsKeepRunning = true

        for(let x = 0; x < validators.length; x++){
            let count = 0
            while(count < 3){
                try{
                    let validatorActivity = await validatorClient.query({query: VALIDATOR_ACTIVITY, variables: {
                        executorId: validators[x],
                        pingsBlockTime: pingsBlockTime,
                        depositAndStakesBlockTime: depositAndStakesBlockTime,
                        depositsBlockTime: depositsBlockTime,
                        withdrawAllsBlockTime: withdrawAllsBlockTime,
                        withdrawsBlockTime: withdrawsBlockTime,
                        unstakeAllsBlockTime: unstakeAllsBlockTime,
                        unstakesBlockTime: unstakesBlockTime,
                        stakesBlockTime: stakesBlockTime,
                        stakeAllsBlockTime: stakeAllsBlockTime
                    }})

                    console.log('validatorActivity', validatorActivity)
                    activity.push(validatorActivity.data)
                    console.log('activity here', activity)
                   
                } catch (err) {
                    console.log('error retrieving validator data: ', err)
                }
               
                for (let y = 0; y < activity.length; y++){
                    for (const [key, value] of Object.entries(activity[y])){
                        switch (key) {
                            case 'depositAndStakes':
                                if(parseInt(value[value.length-1].blockTime) > parseInt(depositAndStakesBlockTime)){
                                    depositAndStakesBlockTime = value[value.length-1].blockTime
                                } else {
                                    depositAndStakesBlockTime = value[value.length-1].blockTime
                                    depositAndStakesKeepRunning = false
                                } 
                                continue
                            case 'deposits':
                                if(parseInt(value[value.length-1].blockTime) > parseInt(depositsBlockTime)){
                                    depositsBlockTime = value[value.length-1].blockTime
                                } else {
                                    depositsBlockTime = value[value.length-1].blockTime
                                    depositsKeepRunning = false
                                } 
                                continue
                            case 'pings':
                                if(parseInt(value[value.length-1].blockTime) > parseInt(pingsBlockTime)){
                                    pingsBlockTime = value[value.length-1].blockTime
                                } else {
                                    pingsBlockTime = value[value.length-1].blockTime
                                    pingsKeepRunning = false
                                } 
                                continue
                            case 'stakeAlls':
                                if(parseInt(value[value.length-1].blockTime) > parseInt(stakeAllsBlockTime)){
                                    stakeAllsBlockTime = value[value.length-1].blockTime
                                } else {
                                    stakeAllsBlockTime = value[value.length-1].blockTime
                                    stakeAllsKeepRunning = false
                                } 
                                continue
                            case 'stakes':
                                if(parseInt(value[value.length-1].blockTime) > parseInt(stakesBlockTime)){
                                    stakesBlockTime = value[value.length-1].blockTime
                                } else {
                                    stakesBlockTime = value[value.length-1].blockTime
                                    stakesKeepRunning = false
                                } 
                                continue
                            case 'unstakeAlls':
                                if(parseInt(value[value.length-1].blockTime) > parseInt(unstakeAllsBlockTime)){
                                    unstakeAllsBlockTime = value[value.length-1].blockTime
                                } else {
                                    unstakeAllsBlockTime = value[value.length-1].blockTime
                                    unstakeAllsKeepRunning = false
                                } 
                                continue
                            case 'unstakes':
                                if(parseInt(value[value.length-1].blockTime) > parseInt(unstakesBlockTime)){
                                    unstakesBlockTime = value[value.length-1].blockTime
                                } else {
                                    unstakesBlockTime = value[value.length-1].blockTime
                                    unstakesKeepRunning = false
                                } 
                                continue
                            case 'withdrawAlls':
                                if(parseInt(value[value.length-1].blockTime) > parseInt(withdrawAllsBlockTime)){
                                    withdrawAllsBlockTime = value[value.length-1].blockTime
                                } else {
                                    withdrawAllsBlockTime = value[value.length-1].blockTime
                                    withdrawAllsKeepRunning = false
                                } 
                                continue
                            case 'withdraws':
                                if(parseInt(value[value.length-1].blockTime) > parseInt(withdrawsBlockTime)){
                                    withdrawsBlockTime = value[value.length-1].blockTime
                                } else {
                                    withdrawsBlockTime = value[value.length-1].blockTime
                                    withdrawsKeepRunning = false
                                } 
                                continue
                        }

                        if(!depositAndStakesKeepRunning && !depositsKeepRunning
                            && !pingsKeepRunning && !stakeAllsKeepRunning
                            && !stakesKeepRunning && !unstakeAllsKeepRunning
                            && !unstakesKeepRunning && !withdrawAllsKeepRunning
                            && !withdrawsKeepRunning){
                                keepRunning = false
                            }
                    }
                }
                count++
            }
        }
        return activity
    }

    //async getAccountValidatorActivity(validatorUris, account){
    async getAccountValidatorActivity(account){
        let activity = []
     //  for(let x = 0; x < validatorUris.length; x++){
            // let validatorClient = new ApolloClient({
            //     uri: validatorUris[x],
            //     cache: new InMemoryCache(),
            // })
           
            try{
                let validatorActivity = await validatorClient.query({query: ACCOUNT_VALIDATOR_ACTIVITY, variables: {
                    accountId: account
                }})
              
                // activity.push([validatorUris[x], validatorActivity])
                activity.push(validatorActivity.data)
            } catch (err) {
                console.log('error retrieving validator data: ', err)
            }
     //   }
        return activity
    }
}

export const queries = new Queries();