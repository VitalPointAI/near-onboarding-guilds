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
    $stakeAllsBlockTime: String!,
    $from: String!,
    $to: String!
    ){
    pings(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId, blockTime_gt: $pingsBlockTime, blockTime_gte: $from, blockTime_lte: $to}){
        blockHeight
        blockTime
        epoch
        rewardsReceived
        newContractStakedBalance
        newContractTotalShares
        executorId
    }
    depositAndStakes(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId, blockTime_gt: $depositAndStakesBlockTime, blockTime_gte: $from, blockTime_lte: $to}){
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
    deposits(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId, blockTime_gt: $depositsBlockTime, blockTime_gte: $from, blockTime_lte: $to}){
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
    withdrawAlls(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId, blockTime_gt: $withdrawAllsBlockTime, blockTime_gte: $from, blockTime_lte: $to}){
        blockHeight
        blockTime
        amount
        newUnstakedBalance
        executorId
    }
    withdraws(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId, blockTime_gt: $withdrawsBlockTime, blockTime_gte: $from, blockTime_lte: $to}){
        blockHeight
        blockTime
        amount
        newUnstakedBalance
        executorId
    }
    unstakes(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId, blockTime_gt: $unstakesBlockTime, blockTime_gte: $from, blockTime_lte: $to}){
        blockHeight
        blockTime
        accountId
        totalRewardsFee
        amount
        spentStakingShareAmount
        totalUnstakedBalance
        totalStakingShares
        contractTotalShares
        contractTotalStakedBalance
        executorId
    }
    unstakeAlls(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId, blockTime_gt: $unstakeAllsBlockTime, blockTime_gte: $from, blockTime_lte: $to}){
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
    stakes(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId, blockTime_gt: $stakesBlockTime, blockTime_gte: $from, blockTime_lte: $to}){
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
    stakeAlls(first: 1000, orderBy: blockHeight, orderDirection: asc, where: {executorId: $executorId, blockTime_gt: $stakeAllsBlockTime, blockTime_gte: $from, blockTime_lte: $to}){   
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
query account_activity(
    $accountId: String!,
    $from: String!,
    $to: String!
    ){
    depositAndStakes(first: 1000, where: {accountIdStaking: $accountId, blockTime_gte: $from, blockTime_lte: $to} ) {
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
    deposits(first: 1000, where: {accountIdDepositing: $accountId, blockTime_gte: $from, blockTime_lte: $to}) {
        id
        blockTime
        blockHeight
        totalRewardsFee
        accountIdDepositing
        deposit
        newUnstakedBalance
        executorId
    }
    withdrawAlls(first: 1000, where: {accountId: $accountId, blockTime_gte: $from, blockTime_lte: $to}) {
        id
        blockTime
        blockHeight
        accountId
        amount
        newUnstakedBalance
        executorId
    }
    withdraws(first: 1000, where: {accountId: $accountId, blockTime_gte: $from, blockTime_lte: $to}) {
        id
        blockTime
        blockHeight
        accountId
        amount
        newUnstakedBalance
        executorId
    }
    unstakeAlls(first: 1000, where: {accountId: $accountId, blockTime_gte: $from, blockTime_lte: $to}) {
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
    unstakes(first: 1000, where: {accountId: $accountId, blockTime_gte: $from, blockTime_lte: $to}) {
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
    stakes(first: 1000, where: {accountIdStaking: $accountId, blockTime_gte: $from, blockTime_lte: $to}){
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
    stakeAlls(first: 1000, where: {accountIdStaking: $accountId, blockTime_gte: $from, blockTime_lte: $to}){
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

    async getValidatorActivity(validators, from, to){
        let validatorActivity
        let activity = []
        let newActivity = []
        let pings = []
        let depositAndStakes = []
        let deposits = []
        let withdrawAlls = []
        let withdraws = []
        let unstakeAlls = []
        let unstakes = []
        let stakes = []
        let stakeAlls = []

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
        
        for(let x = 0; x < validators.length; x++){
            console.log('now processing: ', validators[x])
           
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

            console.log('depositandstakes: ', depositAndStakesKeepRunning)
            console.log('deposits: ', depositsKeepRunning)
            console.log('pings: ', pingsKeepRunning)
            console.log('stakealls: ', stakeAllsKeepRunning)
            console.log('stakes: ', stakesKeepRunning)
            console.log('unstakealls: ', unstakeAllsKeepRunning)
            console.log('unstakes: ', unstakesKeepRunning)
            console.log('withdrawalls: ', withdrawAllsKeepRunning)
            console.log('withdraws: ', withdrawsKeepRunning)


            while(keepRunning){

                console.log('a depositandstakes: ', depositAndStakesKeepRunning)
                console.log('a deposits: ', depositsKeepRunning)
                console.log('a pings: ', pingsKeepRunning)
                console.log('a stakealls: ', stakeAllsKeepRunning)
                console.log('a stakes: ', stakesKeepRunning)
                console.log('a unstakealls: ', unstakeAllsKeepRunning)
                console.log('a unstakes: ', unstakesKeepRunning)
                console.log('a withdrawalls: ', withdrawAllsKeepRunning)
                console.log('a withdraws: ', withdrawsKeepRunning)

                try{
                    validatorActivity = await validatorClient.query({query: VALIDATOR_ACTIVITY, variables: {
                        executorId: validators[x],
                        from: from,
                        to: to,
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
                    // activity.push(validatorActivity.data)
                    // console.log('activity here', activity)
                   
                } catch (err) {
                    console.log('error retrieving validator data: ', err)
                }
               
              //  for (let y = 0; y < validatorActivity.length; y++){
              
                    for (const [key, value] of Object.entries(validatorActivity.data)){
                        console.log('key', key)
                        console.log('value', value)
                        if(!value || value.length == 0){
                            switch (key) {
                                case 'depositAndStakes':
                                    depositAndStakesKeepRunning = false
                                    break
                                case 'deposits':
                                    depositsKeepRunning = false
                                    break
                                case 'pings':
                                    pingsKeepRunning = false
                                    break
                                case 'stakeAlls':
                                    stakeAllsKeepRunning = false
                                    break
                                case 'stakes':
                                    stakesKeepRunning = false
                                    break
                                case 'withdrawAlls':
                                    withdrawAllsKeepRunning = false
                                    break
                                case 'withdraws':
                                    withdrawsKeepRunning = false
                                    break
                                case 'unstakeAlls':
                                    unstakeAllsKeepRunning = false
                                    break
                                case 'unstakes':
                                    unstakesKeepRunning = false
                                    break
                                default:
                                    break
                            }
                        }

                        switch (key) {
                            case 'depositAndStakes':
                                if(depositAndStakesKeepRunning){
                                    value.forEach(element => depositAndStakes.push(element))
                                    //activity = activity.concat(depositAndStakes)
                                    console.log('depositsandstakes', depositAndStakes)
                                    if(parseInt(depositAndStakes[depositAndStakes.length-1].blockTime) > parseInt(depositAndStakesBlockTime)){
                                        depositAndStakesBlockTime = depositAndStakes[depositAndStakes.length-1].blockTime
                                    } else {
                                        depositAndStakesBlockTime = depositAndStakes[depositAndStakes.length-1].blockTime
                                        depositAndStakesKeepRunning = false
                                    } 
                                    break
                                } else {
                                    break
                                }
                            case 'deposits':
                                if(depositsKeepRunning){
                                    value.forEach(element => deposits.push(element))
                                  //  activity = activity.concat(deposits)
                                    console.log('deposits', deposits)
                                    if(parseInt(deposits[deposits.length-1].blockTime) > parseInt(depositsBlockTime)){
                                        depositsBlockTime = deposits[deposits.length-1].blockTime
                                    } else {
                                        depositsBlockTime = deposits[deposits.length-1].blockTime
                                        depositsKeepRunning = false
                                    } 
                                    break
                                } else {
                                    break
                                }
                            case 'pings':
                                if(pingsKeepRunning){
                                    value.forEach(element => pings.push(element))
                                  //  activity = activity.concat(pings)
                                    console.log('pings', pings)
                                    if(parseInt(pings[pings.length-1].blockTime) > parseInt(pingsBlockTime)){
                                        pingsBlockTime = pings[pings.length-1].blockTime
                                        console.log('ping blocktime1', pingsBlockTime)
                                    } else {
                                        pingsBlockTime = pings[pings.length-1].blockTime
                                        console.log('ping blocktime2', pingsBlockTime)
                                        pingsKeepRunning = false
                                    } 
                                    break
                                } else {
                                    break
                                }
                            case 'stakeAlls':
                                if(stakeAllsKeepRunning){
                                    value.forEach(element => stakeAlls.push(element))
                                  //  activity = activity.concat(stakeAlls)
                                    console.log('stakealls', stakeAlls)
                                    if(parseInt(stakeAlls[stakeAlls.length-1].blockTime) > parseInt(stakeAllsBlockTime)){
                                        stakeAllsBlockTime = stakeAlls[stakeAlls.length-1].blockTime
                                    } else {
                                        stakeAllsBlockTime = stakeAlls[stakeAlls.length-1].blockTime
                                        stakeAllsKeepRunning = false
                                    } 
                                    break
                                } else {
                                    break
                                }
                            case 'stakes':
                                if(stakesKeepRunning){
                                    value.forEach(element => stakes.push(element))
                                  //  activity = activity.concat(stakes)
                                    console.log('stakes', stakes)
                                    if(parseInt(stakes[stakes.length-1].blockTime) > parseInt(stakesBlockTime)){
                                        stakesBlockTime = stakes[stakes.length-1].blockTime
                                    } else {
                                        stakesBlockTime = stakes[stakes.length-1].blockTime
                                        stakesKeepRunning = false
                                    } 
                                    break
                                } else {
                                    break
                                }
                            case 'unstakeAlls':
                                if(unstakeAllsKeepRunning){
                                    value.forEach(element => unstakeAlls.push(element))
                                  //  activity = activity.concat(unstakeAlls)
                                    console.log('unstakeAlls', unstakeAlls)
                                    if(parseInt(unstakeAlls[unstakeAlls.length-1].blockTime) > parseInt(unstakeAllsBlockTime)){
                                        unstakeAllsBlockTime = unstakeAlls[unstakeAlls.length-1].blockTime
                                    } else {
                                        unstakeAllsBlockTime = unstakeAlls[unstakeAlls.length-1].blockTime
                                        unstakeAllsKeepRunning = false
                                    } 
                                    break
                                } else {
                                    break
                                }
                            case 'unstakes':
                                if(unstakesKeepRunning){
                                    value.forEach(element => unstakes.push(element))
                                 //   activity = activity.concat(unstakes)
                                    console.log('unstakes', unstakes)
                                    if(parseInt(unstakes[unstakes.length-1].blockTime) > parseInt(unstakesBlockTime)){
                                        unstakesBlockTime = unstakes[unstakes.length-1].blockTime
                                    } else {
                                        unstakesBlockTime = unstakes[unstakes.length-1].blockTime
                                        unstakesKeepRunning = false
                                    } 
                                    break
                                } else {
                                    break
                                }
                            case 'withdrawAlls':
                                if(withdrawAllsKeepRunning){
                                    value.forEach(element => withdrawAlls.push(element))
                                  //  activity = activity.concat(withdrawAlls)
                                    console.log('withdrawalls', withdrawAlls)
                                    if(parseInt(withdrawAlls[withdrawAlls.length-1].blockTime) > parseInt(withdrawAllsBlockTime)){
                                        withdrawAllsBlockTime = withdrawAlls[withdrawAlls.length-1].blockTime
                                    } else {
                                        withdrawAllsBlockTime = withdrawAlls[withdrawAlls.length-1].blockTime
                                        withdrawAllsKeepRunning = false
                                    } 
                                    break
                                } else {
                                    break
                                }
                            case 'withdraws':
                                if(withdrawsKeepRunning){
                                    value.forEach(element => withdraws.push(element))
                                  //  activity = activity.concat(withdraws)
                                    console.log('withdraws', withdraws)
                                    if(parseInt(withdraws[withdraws.length-1].blockTime) > parseInt(withdrawsBlockTime)){
                                        withdrawsBlockTime = withdraws[withdraws.length-1].blockTime
                                    } else {
                                        withdrawsBlockTime = withdraws[withdraws.length-1].blockTime
                                        withdrawsKeepRunning = false
                                    } 
                                    break
                                } else {
                                    break
                                }
                            default:
                                break
                        }
                    
                        if(!depositAndStakesKeepRunning && !depositsKeepRunning
                            && !pingsKeepRunning && !stakeAllsKeepRunning
                            && !stakesKeepRunning && !unstakeAllsKeepRunning
                            && !unstakesKeepRunning && !withdrawAllsKeepRunning
                            && !withdrawsKeepRunning){
                                keepRunning = false
                        }
                    }
                activity = activity.concat(
                    depositAndStakes,
                    deposits,
                    pings,
                    stakes,
                    stakeAlls,
                    unstakes,
                    unstakeAlls,
                    withdraws,
                    withdrawAlls)
                console.log('activity', activity)
            }
        }
        return activity
    }

    //async getAccountValidatorActivity(validatorUris, account){
    async getAccountValidatorActivity(account, from, to){
        let activity = []
     //  for(let x = 0; x < validatorUris.length; x++){
            // let validatorClient = new ApolloClient({
            //     uri: validatorUris[x],
            //     cache: new InMemoryCache(),
            // })
           
            try{
                let validatorActivity = await validatorClient.query({query: ACCOUNT_VALIDATOR_ACTIVITY, variables: {
                    accountId: account,
                    from: from,
                    to: to
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