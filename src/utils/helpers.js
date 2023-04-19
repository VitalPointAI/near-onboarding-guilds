import { config } from '../state/config'
import { queries } from '../utils/graphQueries'
import { get, set } from './storage'
import { ceramic } from './ceramic'
import * as nearAPI from 'near-api-js'
//import { IDX } from '@ceramicstudio/idx'
import _ from 'lodash'
import { yearPriceHistorySchema } from '../schemas/yearPriceHistory'
import { yearTransactionHistorySchema } from '../schemas/yearTransactionHistory'
import { DataModel } from '@glazed/datamodel'
import { DIDDataStore } from '@glazed/did-datastore'

const axios = require('axios').default

export const {
    nameSuffix,
    ACCOUNT_LINKS,
    SENDY_API_KEY_CALL,
    APP_OWNER_ACCOUNT,
    MAIL_URL,
    contractName,
    guildRootName
} = config

export const {
    KeyPair,
    InMemorySigner,
    keyStores,
    connect,
    WalletConnection,
    transactions: {
        addKey, deleteKey, fullAccessKey
    },
    utils: {
        PublicKey,
        format: {
            parseNearAmount, formatNearAmount
        }
    }
} = nearAPI

export async function isAccountTaken(accountId, near) {
    const account = new near.account(accountId + nameSuffix)
    try {
        await account.state()
    } catch(e) {
        console.warn(e)
        if (/does not exist while viewing/.test(e.toString())) {
            return false
        }
    }
    return true
}

export async function login(wallet) {
    wallet.requestSignIn(contractName, 'Near Guilds', guildRootName)
}

export async function logout(wallet) {
    wallet.signOut()
    window.location.replace('/')
}

export async function updateNearPriceAPI(accountId, appIdx, registryContract, appClient){

    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    let allAliases =  await queries.getAppDefinitions('Guilds')
    console.log('allAliases', allAliases)

    let to = new Date()
    console.log('to', to)

    let yearMonthAlias
    let key
    let lastKey
    let existingAliases = await appIdx.get('nearPriceHistory')
    console.log('existing aliases', existingAliases)

    // in first case, the app account has a number of aliases and we just
    // need to append any new ones to it

    let alias
    let getit
    let aliases = {}
    let schemas = {}
    let definitions = {}
    let tiles = {}

    if(existingAliases && existingAliases.history.length > 0){
        console.log('ceramic aliases')
        // we are looking for last date that the app downloaded price data so
        // we need to get the last entry in the nearpricehistory array, then
        // move backwards through each until we find last price entry
        for(let y = 0; y < existingAliases.history.length; y++){
        lastEntry = existingAliases.history[existingAliases.history.length-(y+1)]
        console.log('last entry', lastEntry)

        // with last entry, we can formulate the alias needed
        lastYear = lastEntry[0].substring(0,4)
        console.log('last year', lastYear)

        lastMonth
        for (let x = 0; x < uniqueMonthArray.length; x++){
            if(lastEntry[0].includes(uniqueMonthArray[x])){
                lastMonth = uniqueMonthArray[x]
                break
            }
        }
        console.log('lastMonth', lastMonth)

        key = lastYear+lastMonth+'NearPriceHistory'
        console.log('key', key)

        alias = {[key]: lastEntry[1]}
        console.log('alias', alias)

        let thisIdx = new DataModel({ ceramic: appClient, aliases: alias})
        console.log('thisidx', thisIdx)

        getit = await thisIdx.get(key)
        console.log('get it', getit)
        if(getit && getit.history.length > 0) break
    }

        // set default from (start of mainnet) in even we can't get a from date for some reason
        let from = new Date('October 10, 2020')
        let reservedFromDate = new Date('October 10, 2020')
        if(getit){
            let endDate = new Date(getit.history[getit.history.length-1].date)
            from = new Date(endDate.setDate(endDate.getDate() + 1))
            reservedFromDate = from
        }
        console.log('from', from)
        to = new Date('October 20, 2020')
      
        if(to >= from){
            for (let day = from; day <= to; day.setDate(day.getDate() + 1)) {
                console.log('to here', to)
                console.log('from here', from)
                let thisDay = day.getMonth()
                let thisMonth = uniqueMonthArray[thisDay]
                let thisYear = day.getFullYear()
                let thisKey = thisYear+thisMonth+'NearPriceHistory'
                let aliasData = [{
                    schemaName: thisKey,
                    schemaDescription: thisMonth+thisYear+' near year price history',
                    schema: yearPriceHistorySchema,
                    definitionName: thisKey,
                    definitionDescription: thisMonth+thisYear+' near year price history',
                    accountId: APP_OWNER_ACCOUNT,
                    appName: 'Guilds'
                }]
                yearMonthAlias = await ceramic.createDataAliases(registryContract, aliasData)
                console.log('yearmonthalias', yearMonthAlias)
            }

            let newAppDefinitions =  await queries.getAppDefinitions('Guilds')
            console.log('new definitions', newAppDefinitions)
        
            for (let a = 0; a < newAppDefinitions.length; a++){
                definitions = {
                    ...definitions, 
                    [newAppDefinitions[a]['definitionName']]: newAppDefinitions[a]['definition'] }
            }

            let newAppSchemas = await queries.getAppSchemas('Guilds')
            console.log('new schemas', newAppSchemas)

            for (let b = 0; b < newAppSchemas.length; b++){
                schemas = {
                    ...schemas, 
                    [newAppSchemas[b]['schemaName']]: newAppSchemas[b]['schemaURL'] }
            }

            aliases = {
                schemas: schemas,
                definitions: definitions,
                tiles: tiles
              }

            appIdx = new DIDDataStore({ ceramic: appClient, model: aliases})
            console.log('new appidx', appIdx)

            console.log('reserved from date', reservedFromDate)
            await populateNearPriceAPI(reservedFromDate, to, accountId, appIdx, registryContract, appClient)
            return appIdx
        }
    } else {
        // in this case, there are no aliases and we're starting from scratch
        console.log('no ceramic aliases')
        let from = new Date('October 10, 2020')
        to = new Date('October 20, 2020')
        if(to >= from){
            for (let day = from; day <= to; day.setDate(day.getDate() + 1)) {
                console.log('to here', to)
                console.log('from here', from)
                let thisDay = day.getMonth()
                let thisMonth = uniqueMonthArray[thisDay]
                let thisYear = day.getFullYear()
                let thisKey = thisYear+thisMonth+'NearPriceHistory'
                let aliasData = [{
                    schemaName: thisKey,
                    schemaDescription: thisMonth+thisYear+' near year price history',
                    schema: yearPriceHistorySchema,
                    definitionName: thisKey,
                    definitionDescription: thisMonth+thisYear+' near year price history',
                    accountId: APP_OWNER_ACCOUNT,
                    appName: 'Guilds'
                }]
                yearMonthAlias = await ceramic.createDataAliases(registryContract, aliasData)
                console.log('yearmonthalias', yearMonthAlias)
            }

            let newAppDefinitions =  await queries.getAppDefinitions('Guilds')
            console.log('new definitions', newAppDefinitions)
        
            for (let a = 0; a < newAppDefinitions.length; a++){
                definitions = {
                    ...definitions, 
                    [newAppDefinitions[a]['definitionName']]: newAppDefinitions[a]['definition'] }
            }

            let newAppSchemas = await queries.getAppSchemas('Guilds')
            console.log('new schemas', newAppSchemas)

            for (let b = 0; b < newAppSchemas.length; b++){
                schemas = {
                    ...schemas, 
                    [newAppSchemas[b]['schemaName']]: 'ceramic://'+newAppSchemas[b]['schemaURL'] }
            }

            aliases = {
                schemas: schemas,
                definitions: definitions,
                tiles: tiles
              }

            appIdx = new DIDDataStore({ ceramic: appClient, model: aliases})
            console.log('new appidx', appIdx)

            from = new Date('October 10, 2020')
            console.log('from in', from)
            await populateNearPriceAPI(from, to, accountId, appIdx, registryContract, appClient)
            return appIdx
        }
    }
}


async function populateNearPriceAPI(from, to, accountId, appIdx, registryContract, appClient){
    console.log('near price populating started')
    let allData = []
    let allAliases =  await queries.getAppDefinitions('Guilds')
    let uniqueArray = []
    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    
    console.log('from', from)
    console.log('to', to)
    console.log('allAliases', allAliases)
    let count = 0
    to = new Date('October 20, 2020')
    for (let day = from; day <= to; day.setDate(day.getDate() + 1)) {
        console.log('from', from)
        console.log('to', to)
        if(count < 10){
            let interimDate = Date.parse(day)
            let date
            let formattedDate
            if(interimDate){
                date = formatGeckoDate(interimDate)
                formattedDate = formatDate(interimDate)
            } else {
                date = formatGeckoDate(day)
                formattedDate = formatDate(day)
            }
            console.log('formatteddate', formattedDate)
            let getNearData
            await new Promise(resolve => setTimeout(resolve, 3000))
            try{
                getNearData = await axios.get(`https://api.coingecko.com/api/v3/coins/near/history?date=${date}`)
                console.log('near data', getNearData)
            } catch (err) {
                console.log('problem retrieving price data', err)
                // 5 retries if there is an issue
                await new Promise(resolve => setTimeout(resolve, 70000))
                let retryCount = 0
                while(retryCount < 5){
                    try{
                        getNearData = await axios.get(`https://api.coingecko.com/api/v3/coins/near/history?date=${date}`)
                        console.log('near data', getNearData)
                        break
                    } catch (err) {
                        console.log('retry ' + retryCount + ' unsuccessful', err)
                        retryCount++
                    }
                }
            }
            if(getNearData && getNearData.data.market_data){
                let record = {
                    date: formattedDate,
                    currentPrice: getNearData.data.market_data.current_price
                }
                allData.push(record)
                console.log('allData', allData)
            }
        count++
        } else {
            await new Promise(resolve => setTimeout(resolve, 70000))
            count = 0
            day.setDate(day.getDate() - 1)
        }

    }

    // find all the unique years
    for(let i = 0; i< allData.length; i++){
        let obj = allData[i]
        let year = (new Date(obj.date)).getFullYear()
        if(year){
            if(!(uniqueArray.indexOf(year) > -1)){
                uniqueArray.push(year)
            }
        }
    }

    // filter all Data by year and month and store
    for(let x = 0; x < uniqueArray.length; x++){
        let currentYearArray = []
        let year
        for(let y = 0; y < allData.length; y++){
            year = (new Date(allData[y].date)).getFullYear()
            if(uniqueArray[x] == year){
                currentYearArray.push(allData[y])
            }
        }

        // split year data into month arrays
        for(let y = 0; y < uniqueMonthArray.length; y++){
            let currentMonthArray = []
            let month
            let z = 0
            while(z < currentYearArray.length){
                let d = new Date(currentYearArray[z].date).getMonth()
                console.log('d', d)
                month = uniqueMonthArray[d]
                console.log('month', month)
                if(uniqueMonthArray[y] == month){
                    currentMonthArray.push(currentYearArray[z])
                }
                z++
            }
            if(currentMonthArray && currentMonthArray.length > 0){
               
                let yearMonthAlias
                month = uniqueMonthArray[y]

                for(let q = 0; q < allAliases.length; q++){
                    if(allAliases[q]['definitionName'] == uniqueArray[x]+month+'NearPriceHistory'){
                        yearMonthAlias = allAliases[q]['definition']
                        console.log('yearmonthalias1', yearMonthAlias)
                        break
                    }
                }

                if(!yearMonthAlias){
                    let aliasData = [{
                        schemaName: uniqueArray[x]+month+'NearPriceHistory',
                        schemaDescription: uniqueArray[x]+month+' near year price history',
                        schema: yearPriceHistorySchema,
                        definitionName: uniqueArray[x]+month+'NearPriceHistory',
                        definitionDescription: uniqueArray[x]+month+' near year price history',
                        accountId: APP_OWNER_ACCOUNT,
                        appName: 'Guilds'
                    }]
                    yearMonthAlias = await ceramic.createDataAliases(registryContract, aliasData)
                    console.log('yearmonthalias2', yearMonthAlias)
                }
                console.log('appidx here', appIdx)
                let existingAliases = await appIdx.get('nearPriceHistory')
                console.log('existing aliases here a', existingAliases)
                if(existingAliases == null){
                    let record = {
                        history: []
                    }
                    let result = await appIdx.set('nearPriceHistory', record)
                    console.log('esult', result)
                    existingAliases = await appIdx.get('nearPriceHistory')
                    console.log('existingaliases c', existingAliases)
                }

                let exists = false
                if(existingAliases.history?.length > 0){
                    for(let z = 0; z < existingAliases.history.length; z++){
                        if(existingAliases.history[z][1] == yearMonthAlias.definitions){
                            console.log('here now')
                            exists = true
                        }
                    }
                }
              
                if(!exists){
                    console.log('yearmonthalias b', yearMonthAlias)
                    existingAliases.history.push([uniqueArray[x]+month+'NearPriceHistory', yearMonthAlias.definitions])
                    existingAliases.history.push([yearMonthAlias.definitions])
                    console.log('existingAliases b', existingAliases)
                    let first = await appIdx.set('nearPriceHistory', existingAliases)
                    console.log('history', existingAliases.history)
                    console.log('appidx here', appIdx)
                    console.log('first', first)
                }
                console.log('uniquearray', uniqueArray)
                let key = uniqueArray[x]+month+'NearPriceHistory'
               // let alias = {[key]: yearMonthAlias.definitions}
               // let thisIdx = new DataModel({ ceramic: appClient, aliases: yearMonthAlias.definitions})
               // console.log('thisidx', thisIdx)
                let firstGetIt = await appIdx.get(key)
                console.log('first getit', firstGetIt)
                let entry
                if(firstGetIt && firstGetIt.history.length > 0){
                    console.log('currentmontharray', currentMonthArray)
                   
                    let update = firstGetIt.history.filter(val => !currentMonthArray.includes(val))
                    console.log('update Array', update)
                    entry = {
                        history: update
                    }
                } else {
                    entry = {
                        history: currentMonthArray
                    }
                }
                let second = await appIdx.set(key, entry)
                let getit = await appIdx.get(key)
                console.log('get it end', getit)
            }
        }           
    }
}


export async function isVerified(accountId) {
    let verifiers = await queries.getAddedVerifiers()
    console.log('verifiers', verifiers)
    let removedVerifiers = await queries.getRemovedVerifiers()
    console.log('removedVerifiers', removedVerifiers)
    let combined = verifiers.data.addVerifiers.concat(removedVerifiers.data.removeVerifiers)
    console.log('combined', combined)
    let sorted = _.sortBy(combined, 'time')
    let filtered = sorted.filter(({accountId}) => accountId)
    console.log('filtered', filtered)
    if(filtered.length > 0){
        if(filtered[filtered.length-1].whitelistedBy){
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

export async function isRegistered(account, type, factoryContract, registryContract) {
    let didAdmin = false
    let didVerifier = false
    let adminDid = await ceramic.getDid(account, factoryContract, registryContract)
    adminDid && type == 'admin' ? didAdmin = true : null
    adminDid && type == 'verifier' ? didVerifier = true : null
    return {
        didAdmin,
        didVerifier
    }
}

// these are the guild communities (an account)
export async function updateCurrentGuilds() {
    let currentGuildsList = await queries.getGuilds()
    let sortedGuilds = _.sortBy(currentGuildsList.data.putDIDs, 'registered')
    let deletedGuildsList = await queries.getDeletedGuilds()
    let sortedDeletedGuilds = _.sortBy(deletedGuildsList.data.deleteDIDs, 'time')

    let currentGuilds = []
    let lastIndexAdd
    let lastIndexDelete

    // first - start the loop to look through every one of the guild entries
    for(let k = 0; k < sortedGuilds.length; k++){
      
        // make sure it hasn't already been added to the current guilds list
        if(currentGuilds.filter(e => e.accountId == sortedGuilds[k].accountId).length == 0){
                for(let n = 0; n < sortedGuilds.length; n++){
                    if(sortedGuilds[k].accountId == sortedGuilds[n].accountId){
                        lastIndexAdd = n
                    }
                }
         
            // step 2 - get index of the last time the accountId was deleted
            for(let x = 0; x < sortedDeletedGuilds.length; x++){
                if(sortedGuilds[lastIndexAdd].accountId == sortedDeletedGuilds[x].accountId){
                    lastIndexDelete = x
                }
            }
          
            //  step 3 - if there is a last index added, compare last added with 
            //  last deleted to see if it is still an active guild.  Push it to the
            //  list of current guilds.
            if(lastIndexAdd >= 0 ){
                if(!lastIndexDelete){
                    currentGuilds.push(sortedGuilds[lastIndexAdd])
                }
                if(lastIndexDelete){
                    if(parseFloat(sortedGuilds[lastIndexAdd].registered) > parseFloat(sortedDeletedGuilds[lastIndexDelete].time)) {
                        currentGuilds.push(sortedGuilds[lastIndexAdd])
                    }
                }
            }
        }
    }

return currentGuilds
}


// these are the existing project/product communities on Catalyst (DAO)
export async function updateCurrentCommunities() {
    let currentCommunitiesList = await queries.getAllCommunities()
    let sortedCommunities = _.sortBy(currentCommunitiesList.data.createDAOs, 'created')
 
    let inactivatedCommunitiesList = await queries.getAllInactivatedCommunities()
    let sortedInactivatedCommunities = _.sortBy(inactivatedCommunitiesList.data.inactivateDAOs, 'deactivated')
 
    let currentCommunities = []
    let lastIndexAdd
    let lastIndexDelete

    // first - start the loop to look through every one of the community entries
    for(let k = 0; k < sortedCommunities.length; k++){
      
        // make sure it hasn't already been added to the current communities list
        if(currentCommunities.filter(e => e.contractId == sortedCommunities[k].contractId).length == 0){
                for(let n = 0; n < sortedCommunities.length; n++){
                    if(sortedCommunities[k].contractId == sortedCommunities[n].contractId){
                        lastIndexAdd = n
                    }
                }
         
            // step 2 - get index of the last time the contractId was deleted
            for(let x = 0; x < sortedInactivatedCommunities.length; x++){
                if(sortedCommunities[lastIndexAdd].contractId == sortedInactivatedCommunities[x].contractId){
                    lastIndexDelete = x
                }
            }
      
            //  step 3 - if there is a last index added, compare last added with 
            //  last deleted to see if it is still an active guild.  Push it to the
            //  list of current guilds.
            if(lastIndexAdd > 0 ){
             
                if(parseFloat(sortedCommunities[lastIndexAdd].created) > parseFloat(sortedInactivatedCommunities[lastIndexDelete].deactivated)) {
                    currentCommunities.push(sortedCommunities[lastIndexAdd])
                }
            }
        }
    }

return currentCommunities
}


export async function getGuildsAwaitingVerification(){
    // determine list of guilds awaiting verification
    let currentGuildsList = await updateCurrentGuilds()
    console.log('currentGuildsList', currentGuildsList)
    let verifiedGuilds = await queries.getVerifiedGuilds()
    console.log('verified guilds', verifiedGuilds)
        
    let guildsAwaitingVerification = []
    let guildInList = false
    let verified = false
    for(let oo = 0; oo < currentGuildsList.length; oo++){
        for(let pp = 0; pp < verifiedGuilds.data.changeVerificationStatuses.length; pp++){
            if(currentGuildsList[oo].accountId == verifiedGuilds.data.changeVerificationStatuses[pp].accountId){
                guildInList = true
            }
            if(guildInList){
                if(verifiedGuilds.data.changeVerificationStatuses[pp].verified == true){
                    verified = true
                }
            }
        }
        if(!verified){
            guildsAwaitingVerification.push(currentGuildsList[oo])
        }
    }
    return guildsAwaitingVerification
}


export async function getCurrentVerifiers(){
  // determine list of current verifiers 
  // (take into account those that have been removed)
  let addedVerifiers = await queries.getAddedVerifiers()
  let removedVerifiers = await queries.getRemovedVerifiers()
 
  let currentVerifiers = []
  let verifierExists = false
  let lastIndexAddVerifier
  let lastIndexDeleteVerifier
  for(let m = 0; m < addedVerifiers.data.addVerifiers.length; m++){
      for(let z = 0; z < currentVerifiers.length; z++){
          if(addedVerifiers.data.addVerifiers[m].accountId == currentVerifiers[z].accountId)
          verifierExists = true
      }
      if(!verifierExists){
          for(let n = 0; n < addedVerifiers.data.addVerifiers.length; n++){
              if(addedVerifiers.data.addVerifiers[m].accountId == addedVerifiers.data.addVerifiers[n].accountId){
                  lastIndexAddVerifier = n
                
              }
          }
          for(let x = 0; x < removedVerifiers.data.removeVerifiers.length; x++){
              if(addedVerifiers.data.addVerifiers[lastIndexAddVerifier].accountId == removedVerifiers.data.removeVerifiers[x].accountId){
                  lastIndexDeleteVerifier = x
               
              }
          }

          if(lastIndexAddVerifier >= 0 && lastIndexDeleteVerifier >= 0){
           
              if(parseFloat(addedVerifiers.data.addVerifiers[lastIndexAddVerifier].time) > parseFloat(removedVerifiers.data.removeVerifiers[lastIndexDeleteVerifier].time)) {
                  currentVerifiers.push(addedVerifiers.data.addVerifiers[lastIndexAddVerifier])
              }
          } else {
            
              if(lastIndexAddVerifier >= 0){
                  currentVerifiers.push(addedVerifiers.data.addVerifiers[lastIndexAddVerifier])
              }
          }
      }
  }
  return currentVerifiers
}


export async function getCurrentIndividuals(){
    // determine list of current individuals (take into account those that have been deleted)
    let currentIndividualsList = await queries.getIndividuals()
    let deletedIndividualsList = await queries.getDeletedIndividuals()

    let currentIndividuals = []
    let individualExists = false
    let mostRecentIndiv = false
    for(let kk = 0; kk < currentIndividualsList.data.putDIDs.length; kk++){
        for(let ll = 0; ll < deletedIndividualsList.data.deleteDIDs.length; ll++){
            if(currentIndividualsList.data.putDIDs[kk].accountId == deletedIndividualsList.data.deleteDIDs[ll].accountId){
                individualExists = true
            }
            if(individualExists){
                if(currentIndividualsList.data.putDIDs[kk].registered > deletedIndividualsList.data.deleteDIDs[ll].time){
                    mostRecentIndiv = true
                }
            }
        }
        if(!individualExists || mostRecentIndiv){
            currentIndividuals.push(currentIndividualsList.data.putDIDs[kk])
        }
    }
    return currentIndividuals
}


export async function synchAccountLinks(curUserIdx){

    //synch local links with what's stored for the account in ceramic
    let allAccounts = await ceramic.downloadKeysSecret(curUserIdx, 'accountsKeys')

    let storageLinks = get(ACCOUNT_LINKS, [])
    
    let k = 0
    let didMakeChange = false
    while(k < allAccounts.length){
        // ensure all the existing online accounts and offline accounts match
        let j = 0
        while (j < storageLinks.length){
            if(allAccounts[k].accountId == storageLinks[j].accountId){
                if(allAccounts[k].key != storageLinks[j].key){
                    allAccounts[k].key = storageLinks[j].key
                    didMakeChange = true
                }
                if(allAccounts[k].owner != storageLinks[j].owner){
                    allAccounts[k].owner = storageLinks[j].owner
                    didMakeChange = true
                }
                if(allAccounts[k].keyStored != storageLinks[j].keyStored){
                    allAccounts[k].keyStored = storageLinks[j].keyStored
                    didMakeChange = true
                }
                if(allAccounts[k].publicKey != storageLinks[j].publicKey){
                    allAccounts[k].publicKey = storageLinks[j].publicKey
                    didMakeChange = true
                }
            }
            j++
        }
    k++
    }
            
    // add any accounts that are missing
    let p = 0
    let wasMissing = false
    while(p < storageLinks.length){
        let q = 0
        let exists = false
        while (q < allAccounts.length){
            if(storageLinks[p].accountId == allAccounts[q].accountId){
                exists = true
            } 
        q++
        }
        if(!exists){
            allAccounts.push(storageLinks[p])
            wasMissing = true
        }
        p++
    }
    
    // remove duplicates
    let copyArray = allAccounts
    let z = 0
    let wasDuplicate = false
    while(z < allAccounts.length){
        let r = 0
        let count = 0
        while(r < copyArray.length){
            if(copyArray[r].accountId == allAccounts[z].accountId){
                count++
               
                if(count > 1) {
                    copyArray.splice(r,1)
                    wasDuplicate = true
                }
            }
            r++
        }
        z++
    }
    allAccounts = copyArray

    if(didMakeChange || wasMissing || wasDuplicate){
        await ceramic.storeKeysSecret(curUserIdx, allAccounts, 'accountsKeys')
        set(ACCOUNT_LINKS, allAccounts)
    }
}


export function generateId() {
    let buf = Math.random([0, 999999999])
    let b64 = btoa(buf)
    return b64.toString()
}


export function formatDate(timestamp){
    let intDate = parseInt(timestamp)
    let options = {year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(intDate).toLocaleString('en-US', options)
}


export function formatGeckoDate(timestamp){
    let intDate = parseInt(timestamp)
    let options = {year: 'numeric', month: 'numeric', day: 'numeric'}
    let interim = new Date(intDate).toLocaleString('en-US', options)
    let d = new Date(interim)
    let datestring = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear()
    return datestring
}


export function formatDateString(timestamp){
    if(timestamp){
        let stringDate = timestamp.toString()
        let options = {year: 'numeric', month: 'long', day: 'numeric'}
        return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
    } else {
        return null
    } 
}

export function getPrice(priceArray, date, currency){
    if(priceArray && priceArray.length > 0){
        for(let a = 0; a < priceArray.length; a++){
            if(priceArray[a].date == date){
                let obj = priceArray[a].currentPrice
                let asArray = Object.entries(obj)
                let price = asArray.filter(([key, value]) => key == currency)
                if(price){
                    return price[0][1]
                }
            }
        }
    }
    return false
}

export async function buildPriceTable(from, to, appClient){
    
    let allAliases =  await queries.getAppDefinitions('Guilds')
    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"]

    let everyDayAlias = []
    for (let day = new Date(from); day <= new Date(to); day.setDate(day.getDate() + 1)) {
        let dayYear = new Date(day).getFullYear()
        let dayD = new Date(day).getMonth()
        let dayMonth = uniqueMonthArray[dayD]
        everyDayAlias.push(dayYear+dayMonth+'NearPriceHistory')
    }

    let aliasList = everyDayAlias.filter((x, i, a) => a.indexOf(x) === i)

    let aliases = {}
    for(let y = 0; y < aliasList.length; y++){
        for(let x = 0; x < allAliases.length; x++){
            if(aliasList[y] == allAliases[x]['definitionName']){
                aliases = {...aliases, [aliasList[y]]: allAliases[x]['definition']}
            }
        }
    }

    let thisIdx = new IDX({ ceramic: appClient, aliases: aliases})

    let pricingArray = []
    for(let z = 0; z < aliasList.length; z++){
        let priceObject = await thisIdx.get(aliasList[z])
        if(priceObject != null){
            pricingArray = pricingArray.concat(priceObject.history)
        }
    }
    return pricingArray
}

export async function buildTransactionTable(from, to, accountId, account, factoryContract, registryContract, appIdx){
    console.log('from build table', from)
    console.log('to build table', to)
    let allAliases = await queries.getAliases()
    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"]

    let everyDayAlias = []
    for (let day = new Date(from); day <= new Date(to); day.setDate(day.getDate() + 1)) {
        console.log('day', day)
        let dayYear = new Date(day).getFullYear()
        console.log('dayYear', dayYear)
        let dayD = new Date(day).getMonth()
        console.log('dayD', dayD)
        let dayMonth = uniqueMonthArray[dayD]
        console.log('dayMonth', dayMonth)
        everyDayAlias.push(dayYear+dayMonth+'NearTransactionHistory')
    }
    console.log('every day alias', everyDayAlias)
    let aliasList = everyDayAlias.filter((x, i, a) => a.indexOf(x) === i)
    console.log('aliasList', aliasList)
    let aliases = {}
    for(let y = 0; y < aliasList.length; y++){
        for(let x = 0; x < allAliases.data.storeAliases.length; x++){
            if(aliasList[y] == allAliases.data.storeAliases[x].alias){
                aliases = {...aliases, [aliasList[y]]: allAliases.data.storeAliases[x].definition}
            }
        }
    }
    console.log('alias check', aliases)

    let thisIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, registryContract, aliases)

    let transactionArray = []
    for(let z = 0; z < aliasList.length; z++){
        let transactionObject = await thisIdx.get(aliasList[z], thisIdx.id)
        if(transactionObject != null){
            transactionArray = transactionArray.concat(transactionObject.history)
        }
    }

    return transactionArray
    
    // let appClient = await ceramic.getAppCeramic(accountId)
    // let allAliases = await queries.getAliases()
    // const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"]

    // let everyDayAlias = []
   
    // let adjustedFrom = new Date(from)
    // adjustedFrom.setDate(adjustedFrom.getDate()+1)
    // let adjustedTo = new Date(to)
    // adjustedTo.setDate(adjustedTo.getDate()+1)
    // for (let day = new Date(adjustedFrom); day <= adjustedTo; day.setDate(day.getDate() + 1)) {
    //     console.log('day build', day)
    //     let dayYear = new Date(day).getFullYear()
    //     let dayD = new Date(day).getMonth()
    //     let dayMonth = uniqueMonthArray[dayD]
    //     everyDayAlias.push(dayYear+dayMonth+'NearTransactionHistory')
    // }

    // let aliasList = everyDayAlias.filter((x, i, a) => a.indexOf(x) === i)
    // console.log('aliasList', aliasList)

    // let aliases = {}
    // for(let y = 0; y < aliasList.length; y++){
    //     for(let x = 0; x < allAliases.data.storeAliases.length; x++){
    //         if(aliasList[y] == allAliases.data.storeAliases[x].alias){
    //             aliases = {...aliases, [aliasList[y]]: allAliases.data.storeAliases[x].definition}
    //         }
    //     }
    // }
    // console.log('aliases', aliases)

    // let thisIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, registryContract, aliases)
    // console.log('thisidx', thisIdx)

    // let transactionArray = []
    // for(let z = 0; z < aliasList.length; z++){
    //     let transactionObject = await thisIdx.get(aliasList[z], thisIdx.id)
    //     console.log('transactionObject', transactionObject)
    //     if(transactionObject != null){
    //         transactionArray = transactionArray.concat(transactionObject.history)
    //     }
    // }

    // console.log('transactionArray', transactionArray)
    // return transactionArray
}

export async function updateNearTransactionAPI(accountId, appIdx, factoryContract, registryContract, account, update){
    
    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    let allAliases = await queries.getAliases()

    let to = new Date()

    let existingAliases = await appIdx.get('nearTransactionHistory', appIdx.id)

    let lastKey = existingAliases.history[existingAliases.history.length-1][0]

    let lastYear = lastKey.substring(0,4)

    let lastMonth
    for (let x = 0; x < uniqueMonthArray.length; x++){
        if(lastKey.includes(uniqueMonthArray[x])){
            lastMonth = uniqueMonthArray[x]
            break
        }
    }

    let key = lastYear+lastMonth+'NearTransactionHistory'

    let yearMonthAlias
    for(let q = 0; q < allAliases.data.storeAliases.length; q++){
        if(allAliases.data.storeAliases[q].alias == key){
            yearMonthAlias = allAliases.data.storeAliases[q].definition
            break
        }
    }

    let alias = {[key]: yearMonthAlias}
    let appClient = await ceramic.getAppCeramic(accountId)

    let thisIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, registryContract, alias)
    let getit = await thisIdx.get(key, thisIdx.id)
    console.log('getit trans api', getit)

    let from = null
    if(getit.history.length != 0){
        let endDate = new Date(getit.history[getit.history.length-1].date)
        let eDay = endDate.getMonth()
        let eMonth = uniqueMonthArray[eDay]
        let eYear = endDate.getFullYear()
        from = new Date(eMonth+' 1 '+eYear)
        console.log('from new', from)
        //from = new Date(endDate.setDate(endDate.getDate() + 1))
    }

    if(!from){
        from = new Date('October 18, 2020 00:00:01')
    }

    if(to >= from){
        for (let day = new Date(from); day <= to; day.setDate(day.getDate() + 1)) {
            let thisDay = day.getMonth()
            let thisMonth = uniqueMonthArray[thisDay]
            let thisYear = day.getFullYear()
            let thisKey = thisYear+thisMonth+'NearTransactionHistory'
            yearMonthAlias = await ceramic.getAlias(APP_OWNER_ACCOUNT, thisKey, appClient, yearTransactionHistorySchema, thisMonth+thisYear+' near year transaction history', registryContract)
        }

        let newAllAliases = await queries.getAliases()
      
        let interimAliases = {}
        for (let a = 0; a < newAllAliases.data.storeAliases.length; a++){
            interimAliases = {...interimAliases, [newAllAliases.data.storeAliases[a]['alias']]: newAllAliases.data.storeAliases[a]['definition'] }
        }
   
        appIdx = new DIDDataStore({ ceramic: appClient, model: interimAliases})

        await populateNearTransactionAPI(from, to, accountId, appIdx, factoryContract, registryContract, account)
        
    }

    // let today = new Date()
    // let to = today
    // let t = today.getMonth()
    // let todayMonth = uniqueMonthArray[t]
    // let todayYear = today.getFullYear()
    // let todayTimestamp = today.getTime()
    // let todayFormattedDate = formatDate(todayTimestamp)

    // let existingAliases = await appIdx.get('nearTransactionHistory', appIdx.id)
    // console.log('existingAliases', existingAliases)

    // get all the aliases so we can create an idx with this month and year's alias
    // for(let q = 0; q < allAliases.data.storeAliases.length; q++){
    //     if(allAliases.data.storeAliases[q].alias == todayYear+todayMonth+'NearTransactionHistory'){
    //         yearMonthAlias = allAliases.data.storeAliases[q].definition
    //         console.log('inside alias', yearMonthAlias)
    //         break
    //     }
    // }

    // get this month's transaction data stream so we can look at the last entry
    // let key = todayYear+todayMonth+'NearTransactionHistory'
    // let alias = {[key]: yearMonthAlias}
    // console.log('alias', alias)
    //let appClient = await ceramic.getAppCeramic(accountId)
    // let thisIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, registryContract, alias)
    // console.log('thisidx', thisIdx)
    // let thisIdx = new IDX({ ceramic: appClient, aliases: alias})
    // console.log('thisidx', thisIdx)
    // let getit = await thisIdx.get(key, thisIdx.id)
    // console.log('get it', getit)
    // let from
    // if(getit){
    //     let endDate = new Date(getit.history[getit.history.length-1].date)
    //     from = new Date(endDate.setDate(endDate.getDate() + 1))
    //     console.log('from', from)
    // } 
    // if(!from){
    //     from = new Date('October 1, 2020 00:00:01')
    // }
    // if(to.getTime() >= from.getTime()){
    //     await populateNearTransactionAPI(from, to, accountId, appIdx, factoryContract, registryContract, account)
    // }
}

export async function clearCeramicTransactionData(account, appIdx, factoryContract, registryContract){
    let allAliases = await queries.getAliases()
    
    for(let x = 0; x < allAliases.data.storeAliases.length; x++){
        if(allAliases.data.storeAliases[x].description.includes('transaction')){
            let key = allAliases.data.storeAliases[x].alias
            let def = allAliases.data.storeAliases[x].definition
            let alias = {[key]: def}
            let thisIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, registryContract, alias)
            let existingData = await thisIdx.get(key, thisIdx.id)
            console.log('existing data before', existingData)
            if(existingData != null){
                let record = {
                    history: []
                }
                await thisIdx.set(key, record)
                dataCheck = await thisIdx.get(key, thisIdx.id)
                console.log('existing data after', dataCheck)
            }
        }
    }
}

export async function clearCeramicPriceData(appIdx){
    let allAliases = await queries.getAliases()
    
    for(let x = 0; x < allAliases.data.storeAliases.length; x++){
        if(allAliases.data.storeAliases[x].description.includes('price')){
            let key = allAliases.data.storeAliases[x].alias
            let existingData = await appIdx.get(key, appIdx.id)
            console.log('existing price data before', existingData)
            if(existingData != null){
                let record = {
                    history: []
                }
                await appIdx.set(key, record)
                dataCheck = await appIdx.get(key, appIdx.id)
                console.log('existing price data after', dataCheck)
            }
        }
    }
}

export async function populateNearTransactionAPI(from, to, accountId, appIdx, factoryContract, registryContract, account){
    console.log('from pop', from)
    console.log('to pop', to)
    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    let appClient = await ceramic.getAppCeramic(accountId)

    let allData = []
    let allAliases = await queries.getAliases()

    // find last month that has data
    
    let exists = false
    let startDate = new Date()
   // let currentYear = currentYear.getFullYear()
   // let currentMonth = uniqueMonthArray[startDate.getMonth()]

    let lastTime
    //while(!exists){
    console.log('all aliases', allAliases)
    for(let a = allAliases.data.storeAliases.length-1; a >= 0; a--){
        if(allAliases.data.storeAliases[a].description.includes('transaction')){
       // let key = (currentYear+a)+currentMonth+'NearTransactionHistory'
       
        // let firstAlias
        // for(let h = 0; h < allAliases.data.storeAliases.length; h++){
        //     if(allAliases.data.storeAliases[h].alias == key){
        //         firstAlias = allAliases.data.storeAliases[h].definition
        //         break
        //     }
        // }
            let key = allAliases.data.storeAliases[a].alias
            let defn = allAliases.data.storeAliases[a].definition
            let alias = {[key]: defn}
            console.log('alias', alias)
            let thisIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, registryContract, alias)
            console.log('thisidx', thisIdx)
            
            let transData = await thisIdx.get(key, thisIdx.id)
            console.log('transData', transData)

            // get last month and year
            if(transData && transData.history.length > 0){
                // set lasttime to just before first of the month of the last transaction
                lastTime = new Date((transData.history[transData.history.length - 1].transaction.block_timestamp-1)/1000000)
                break
                // exists = true
            }
            
            if(new Date().getTime() <= new Date('October 18, 2020 00:00:01').getTime()){
                lastTime = new Date('October 18, 2020 00:00:01')
                break
            //    exists = true
            }

            if(a == 0 && transData && transData.history.length == 0){
                lastTime = new Date('October 18, 2020 00:00:01')
            }
        }

     //   startDate.setDate(startDate.getDate() - 30) 
    }
    console.log('lastTime', lastTime)

    let allTransactions = []
    let count = 0
    let done = false
    
    while(done != true){
      let transBatch = await axios.get(`${nearblocksAPIURL}${accountId}&limit=25&offset=${count}`)
      console.log('transBatch', transBatch)
      if(transBatch.data.txns.length == 0){
        done = true
        break
      }
      for(let z = 0; z < transBatch.data.txns.length; z++){
         if(lastTime){
           if(transBatch.data.txns[z].block_timestamp/1000000 > lastTime.getTime()){
                allTransactions.push(transBatch.data.txns[z])
           } else {
                done = true
           }
         } else {
            allTransactions.push(transBatch.data.txns[z])
         }
      }
      count = count + 25
    }
    console.log('all transactions', allTransactions)      

        for(let x = 0; x < allTransactions.length; x++){
            // get transaction day
            let currentDay = new Date(parseFloat(allTransactions[x].block_timestamp)/1000000)
            let tyear = currentDay.getUTCFullYear()
            let tmonth = currentDay.getUTCMonth()
            let tday = currentDay.getUTCDate()
            let newDate = new Date(tyear, tmonth, tday)
            console.log('currentDay', newDate)
            console.log('currentDay time', newDate.getTime())
            
            if(newDate.getTime() >= from.getTime() && newDate.getTime() <= to.getTime()){
                console.log('in here')
                let formattedDate = formatDate(newDate.getTime())
                let record = {
                    date: formattedDate,
                    transaction: allTransactions[x]
                }
                allData.push(record)
            }
        }
        console.log('all data', allData)
    
    // find all the unique years
    let uniqueArray = []
    
    for(let i = 0; i< allData.length; i++){
        let obj = allData[i]
        console.log('obj', obj)
        let year = (new Date(obj.date)).getFullYear()
        if(year){
            if(!(uniqueArray.indexOf(year) > -1)){
                uniqueArray.push(year)
            }
        }
    }
    console.log('unique array', uniqueArray)

    // filter all Data by year and month and store
    for(let x = 0; x < uniqueArray.length; x++){
        let currentYearArray = []
        let year
        for(let y = 0; y < allData.length; y++){
            year = (new Date(allData[y].date)).getFullYear()
            if(uniqueArray[x] == year){
                currentYearArray.push(allData[y])
            }
        }
        console.log('current year array', currentYearArray)

        // split year data into month arrays
        for(let y = 0; y < uniqueMonthArray.length; y++){
            let currentMonthArray = []
            let month
            let z = 0
            while(z < currentYearArray.length){
                let d = new Date(currentYearArray[z].date).getMonth()
                console.log('d', d)
                month = uniqueMonthArray[d]
                console.log('month', month)
                if(uniqueMonthArray[y] == month){
                    currentMonthArray.push(currentYearArray[z])
                }
                z++
            }
            if(currentMonthArray && currentMonthArray.length > 0){
                console.log('currentmontharray', currentMonthArray)
                
                let yearMonthAlias
                console.log('month', month)
                console.log('month unique array', uniqueMonthArray[y])
                month = uniqueMonthArray[y]
                console.log('all aliases', allAliases)
                console.log('check it', uniqueArray[x]+month+'NearTransactionHistory')
                for(let q = 0; q < allAliases.data.storeAliases.length; q++){
                    if(allAliases.data.storeAliases[q].alias == uniqueArray[x]+month+'NearTransactionHistory'){
                        yearMonthAlias = allAliases.data.storeAliases[q].definition
                        console.log('inside alias', yearMonthAlias)
                        break
                    }
                }
                if(!yearMonthAlias){
                    console.log('why here')
                    yearMonthAlias = await ceramic.getAlias(APP_OWNER_ACCOUNT, uniqueArray[x]+month+'NearTransactionHistory', appClient, yearTransactionHistorySchema, uniqueArray[x]+month+' near year transaction history', registryContract)
                }
                console.log('yearMonthAlias', yearMonthAlias)

                let existingAliases = await appIdx.get('nearTransactionHistory', appIdx.id)
                console.log('existingAliases', existingAliases)
                
                if(existingAliases == null){
                    let record = {
                        history: []
                    }
                    await appIdx.set('nearTransactionHistory', record)
                    existingAliases = await appIdx.get('nearTransactionHistory', appIdx.id)
                    console.log('existing aliases', existingAliases)
                }

                let exists = false
                if(existingAliases.history.length > 0){
                    for(let z = 0; z < existingAliases.history.length; z++){
                        if(existingAliases.history[z][1] == yearMonthAlias){
                            exists = true
                        }
                    }
                }
                console.log('exists', exists)
                if(!exists){
                    existingAliases.history.push([uniqueArray[x]+month+'NearTransactionHistory', yearMonthAlias])
                    let first = await appIdx.set('nearTransactionHistory', existingAliases)
                    console.log('history', existingAliases.history)
                }
        
               
                let key = uniqueArray[x]+month+'NearTransactionHistory'
                let alias = {[key]: yearMonthAlias}
                console.log('alias', alias)
                //let thisIdx = new IDX({ ceramic: appClient, aliases: alias})
                let thisIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, registryContract, alias)
                console.log('thisidx', thisIdx)
                let firstGetIt = await thisIdx.get(key, thisIdx.id)
                let entry = {
                        history: currentMonthArray
                    }
                let second = await thisIdx.set(key, entry)
                let getit = await thisIdx.get(key, thisIdx.id)
                console.log('get it', getit)
            }
        }           
    }
}


// export async function hasKey(key, accountId, near) {
//     const keyPair = KeyPair.fromString(key)
//     const pubKeyStr = keyPair.publicKey.toString()

//     if (!near) {
//         const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair)
//         near = await nearAPI.connect({
//             networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
//         })
//     }

//     const account = new nearAPI.Account(near.connection, accountId)
//     try {
//         const accessKeys = await account.getAccessKeys()
//         if (accessKeys.length > 0 && accessKeys.find(({ public_key }) => public_key === pubKeyStr)) {
//             return true
//         }

//     } catch (e) {
//         console.warn(e)
//     }
//     return false
// }

export async function hasKey(account) {
    try {
        const accessKeys = await account.getAccessKeys()
        if (accessKeys.length > 0 && accessKeys.find(({ public_key }) => public_key === pubKeyStr)) {
            return true
        }

    } catch (e) {
        console.warn(e)
    }
    return false
}

async function sendMessage(content, data, curDaoIdx){
    let request = new XMLHttpRequest()
    try{
        let hookArray = await ceramic.downloadKeysSecret(curDaoIdx, 'apiKeys')
  
        if(hookArray && Object.keys(hookArray).length != 0){
            let hook = hookArray[0].api
            if((data.type == 'proposal' && hookArray[0].discordActivation == true && hookArray[0].proposalActivation == true)
            || (data.type == "sponsor" && hookArray[0].discordActivation == true && hookArray[0].sponsorActivation == true)
            || (data.type == "process" && hookArray[0].discordActivation == true && hookArray[0].passedProposalActivation == true))
            {
                request.open("POST", `${hook}`)

                request.setRequestHeader('Content-type', 'application/json')

                    let embeddedData = {
                    author: {
                            name: 'Check It Out!',
                            url: data.url
                        }
                    }

                    let params = {
                        username: `${data.botName}`,
                        content: content,
                        embeds: [embeddedData]
                    }

                    request.send(JSON.stringify(params))
                    return true
            }
        }
    } catch (err) {
        console.log('notification error ', err)
    }
    return false
}

export async function signalCounter(signalType, contractId, accountId, proposalType, near, appIdx, registryContract, guildDid, factoryContract){
    let currentProperties
    let stream
   
    let guildAccount = new nearAPI.Account(near.connection, contractId)
    let curDaoIdx = await ceramic.getUserIdx(guildAccount, appIdx, factoryContract, registryContract)
  
    switch(proposalType){
        case 'guild':
            try{
                currentProperties = await curDaoIdx.get('guildProfile', guildDid)
             
                stream = 'guildProfile'
                break
            } catch (err) {
                console.log('problem retrieving guild signal details', err)
            }
        case 'individual':
            try{
                currentProperties = await curDaoIdx.get('profile', curDaoIdx.id)
                stream = 'profile'
                break
            } catch (err) {
                console.log('problem retrieving individual signal details', err)
            }
        default:
            break
    }   
  
    let hasLiked = false
    hasLiked = currentProperties.likes.includes(accountId)
   
    if(signalType == 'like' && !hasLiked){
        currentProperties.likes.push(accountId)
    }

    if(signalType == 'like' && hasLiked){
      let index = currentProperties.likes.indexOf(accountId)
      currentProperties.likes.splice(index, 1)
    }
    
    try{
        await curDaoIdx.set(stream, currentProperties)
    } catch (err) {
        console.log('error with signalling', err)
    }
}

export async function signal(signalType, curDaoIdx, accountId, proposalType){
 
    let currentProperties
    let stream
    switch(proposalType){
        case 'guild':
            try{
                currentProperties = await curDaoIdx.get('guildProfile', curDaoIdx.id)
             
                stream = 'guildProfile'
                break
            } catch (err) {
                console.log('problem retrieving guild signal details', err)
            }
        case 'individual':
            try{
                currentProperties = await curDaoIdx.get('profile', curDaoIdx.id)
                stream = 'profile'
                break
            } catch (err) {
                console.log('problem retrieving individual signal details', err)
            }
        default:
            break
    }   
  
    let hasLiked = false
    let hasDisLiked = false
    let hasNeutral = false
        
    hasLiked = currentProperties.likes.includes(accountId)
    hasDisLiked = currentProperties.dislikes.includes(accountId)
    hasNeutral = currentProperties.neutrals.includes(accountId)

    if(signalType == 'like' && !hasLiked){
        currentProperties.likes.push(accountId)
        
        if(hasDisLiked){
            let k = 0
            while (k < currentProperties.dislikes.length){
                if(currentProperties.dislikes[k] == accountId){
                    currentProperties.dislikes.splice(k,1)
                    break
                }
            k++
            }
        }
        if(hasNeutral){
            let k = 0
            while (k < currentProperties.neutrals.length){
                if(currentProperties.neutrals[k] == accountId){
                    currentProperties.neutrals.splice(k,1)
                    break
                }
            k++
            }
        }
    }

    if(signalType == 'dislike' && !hasDisLiked){
        currentProperties.dislikes.push(accountId)
        if(hasLiked){
            let k = 0
            while (k < currentProperties.likes.length){
                if(currentProperties.likes[k] == accountId){
                    currentProperties.likes.splice(k,1)
                    break
                }
            k++
            }
        }
        if(hasNeutral){
            let k = 0
            while (k < currentProperties.neutrals.length){
                if(currentProperties.neutrals[k] == accountId){
                    currentProperties.neutrals.splice(k,1)
                    break
                }
            k++
            }
        }
    }

    if(signalType == 'neutral' && !hasNeutral){
        currentProperties.neutrals.push(accountId)
        if(hasLiked){
            let k = 0
            while (k < currentProperties.likes.length){
                if(currentProperties.likes[k] == accountId){
                    currentProperties.likes.splice(k,1)
                    break
                }
            k++
            }
        }
        if(hasDisLiked){
            let k = 0
            while (k < currentProperties.dislikes.length){
                if(currentProperties.dislikes[k] == accountId){
                    currentProperties.dislikes.splice(k,1)
                    break
                }
            k++
            }
        }
    }
    
    try{
        await curDaoIdx.set(stream, currentProperties)
    } catch (err) {
        console.log('error with signalling', err)
    }
}

export async function getSendyAPI(){
    let token = get(AUTH_TOKEN, [])

    let retrieveSeed = await axios.post(SENDY_API_KEY_CALL, {
        // ...data
      },{
        headers: {
          'Authorization': `Basic ${token}`
        }
      })
    return retrieveSeed
}

export async function getCommunityMemberStatus(platform, contractId, account){
    if(platform == 'Catalyst'){
        try{
            let contract = await catalystDao.initDaoContract(account, contractId)
            let thisMemberStatus = await contract.getMemberStatus({member: account.accountId})
            return thisMemberStatus
        } catch (err) {
            console.log('error retrieving community member status', err)
        }
    }
}

export function getStatus(flags) {
    
    
   /* flags [
        0: sponsored, 
        1: processed, 
        2: didPass, 
        3: cancelled,
    ]
    */
    let sponsored = flags[0]
  
    let processed = flags[1]

    let passed = flags[2]

    let cancelled = flags[3]


    if(cancelled){
        return 'Cancelled'
    }
    if(!sponsored && !processed && !passed && !cancelled){
        return 'Submitted'
    }
    if(sponsored && !processed && !passed && !cancelled){
         return 'Sponsored'
    }
    if(sponsored && processed && passed){
        return 'Passed'
    }
    if(sponsored && processed && !passed){
        return 'Not Passed'
    }    
}

export function getCombinedSkills(accountType, persona){
     let combinedPersonaSkills = []
     if(accountType != 'guild'){
    //    if(persona && Object.keys(persona).length > 0){
    //        for (const [key, value] of Object.entries(persona.developerSkillSet)){
    //        if(value){
    //            combinedPersonaSkills.push(value)
    //        }
    //        }
    //        for (const [key, value] of Object.entries(persona.skillSet)){
    //        if(value){
    //            combinedPersonaSkills.push(value)
    //        }
    //        }
    //    }

       if (persona && persona.personaSkills.length > 0){
         persona.personaSkills.map((values, index) => {
           if(values.name){
             combinedPersonaSkills.push(values.name)
           }
         })
       }

       if (persona && persona.personaSpecificSkills.length > 0){
         persona.personaSpecificSkills.map((values, index) => {
           if(values.name){
             combinedPersonaSkills.push(values.name)
           }
         })
       }
      
       return combinedPersonaSkills
     } else {
        // if(persona && Object.keys(persona).length > 0){
        //     for (const [key, value] of Object.entries(persona.skills)){
        //     if(value){
        //         combinedPersonaSkills.push(value)
        //     }
        //     }
        //     for (const [key, value] of Object.entries(persona.specificSkills)){
        //     if(value){
        //         combinedPersonaSkills.push(value)
        //     }
        //     }
        // }
 
        if (persona && persona.skills.length > 0){
        
          persona.skills.map((values, index) => {
            if(values.name){
              combinedPersonaSkills.push(values.name)
            }
          })
        }
 
        if (persona && persona.specificSkills.length > 0){
       
          persona.specificSkills.map((values, index) => {
            if(values.name){
              combinedPersonaSkills.push(values.name)
            }
          })
        }
        
        return combinedPersonaSkills
     }

}