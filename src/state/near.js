import * as nearAPI from 'near-api-js'
import { get, set, del } from '../utils/storage'
import { APP_OWNER_ACCOUNT, ceramic } from '../utils/ceramic'
import { IDX } from '@ceramicstudio/idx'
import { registry } from '../utils/registry'
import { config } from './config'
import { factory } from '../utils/factory'
import { nft } from '../utils/nft'
import { funding } from '../utils/funding'
import { queries } from '../utils/graphQueries'
import { catalystDao } from '../utils/catalystDao'
import { yearPriceHistorySchema } from '../schemas/yearPriceHistory'
import { yearTransactionHistorySchema } from '../schemas/yearTransactionHistory'
const axios = require('axios').default

export const {
    FUNDING_DATA, 
    FUNDING_DATA_BACKUP, 
    ACCOUNT_LINKS, 
    DAO_LINKS, 
    GAS, 
    SEED_PHRASE_LOCAL_COPY, 
    FACTORY_DEPOSIT, 
    DAO_FIRST_INIT, 
    CURRENT_DAO, 
    REDIRECT, 
    FT_FIRST_INIT, 
    NEW_PROPOSAL, 
    NEW_SPONSOR, 
    NEW_CANCEL, 
    KEY_REDIRECT, 
    OPPORTUNITY_REDIRECT, 
    NEW_PROCESS, 
    NEW_VOTE, 
    DASHBOARD_ARRIVAL, 
    DASHBOARD_DEPARTURE, 
    WARNING_FLAG, 
    PERSONAS_ARRIVAL, 
    EDIT_ARRIVAL, 
    COMMUNITY_ARRIVAL, 
    NEW_DONATION, 
    NEW_EXIT, 
    NEW_RAGE, 
    NEW_DELEGATION, 
    OPPORTUNITY_NOTIFICATION, 
    PROPOSAL_NOTIFICATION, 
    TOKEN_FACTORY_DEPOSIT,
    NEW_NOTIFICATIONS, 
    IPFS_PROVIDER, 
    PLATFORM_SUPPORT_ACCOUNT, 
    STORAGE,
    NEW_REVOCATION, 
    INACTIVATE_COMMUNITY, 
    NEW_INACTIVATION, 
    NEW_CHANGE_PROPOSAL,
    SPACE_CREATED,
    networkId, 
    nodeUrl, 
    walletUrl, 
    nameSuffix, 
    nftFactorySuffix, 
    explorerUrl,
    contractName, 
    didRegistryContractName,
    fundingContractName,
    REGISTRY_API_URL, 
    FIRST_TIME,
    NO_GAS,
    personaRootName,
    guildRootName,
    MAIL_URL,
    AUTH_TOKEN,
    SENDY_API_KEY_CALL,
    FUNDING_SEED_CALL,
    daoRootName,
    nearblocksAPIURL
} = config

export const {
    KeyPair,
    InMemorySigner,
    keyStores,
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

export const initNear = () => async ({ update, getState, dispatch }) => {
   
    let finished = false

    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    })
 
    const isAccountTaken = async (accountId) => {
        const account = new nearAPI.Account(near.connection, accountId);
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

    // resume wallet / contract flow
    const wallet = new nearAPI.WalletAccount(near)
    console.log('wallet', wallet)
    wallet.signIn = () => {
        wallet.requestSignIn({
            contractId: contractName,
            title: 'My NEAR Journey',
        })
        window.location.assign('/')
    }
   
    wallet.signedIn = wallet.isSignedIn()
    if (wallet.signedIn) {
        wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 2)
        update('',{balance: wallet.balance})
    }

    wallet.isAccountTaken = async (accountId) => {
        const accountTaken = await isAccountTaken(accountId + nameSuffix)
        update('app', { accountTaken, wasValidated: true })
    }

    const contract = new nearAPI.Contract(wallet.account(), contractName, {
        changeMethods: ['send', 'create_account', 'create_account_and_claim'],
    })

    // initiate global contracts
    const didRegistryContract = await registry.initiateDidRegistryContract(wallet.account())
    const factoryContract = await factory.initFactoryContract(wallet.account())
    const nftContract = await nft.initNFTContract(wallet.account())
    const fundingContract = await funding.initFundingContract(wallet.account())
    
    if(wallet.signedIn){
        console.log('here')
        // ********* Check and action redirects after DAO and proposal creation *************
        let urlVariables = window.location.search
        const urlParameters = new URLSearchParams(urlVariables)
        let transactionHash = urlParameters.get('transactionHashes')

        let page = get(REDIRECT, [])

        if (page.action == true){
            window.location.assign(page.link)
            set(REDIRECT, {action: false, link: ''})
        }
        
        // if(transactionHash){
        //     let pageMember = get(OPPORTUNITY_REDIRECT, [])
        //     if (pageMember.action == true){
        //         let link=`/dao/${pageMember.contractId}?transactionHashes=${transactionHash}`
        //         window.location.assign(link)
        //         set(OPPORTUNITY_REDIRECT, {action: false, link: ''})
        //     }
        // }

        // ********* Initiate wallet account ************

        const account = wallet.account()
        const accountId = account.accountId

        // ********* Initialize Registry/Funding Contract****************
        // let thisAllowance = parseNearAmount('2')
        // await didRegistryContract.init({
        //     adminId: 'vitalpointai.testnet',
        //     fundingPublicKey: '',
        //     allowance: thisAllowance})
        //await fundingContract.init({adminId: 'vitalpointai.testnet'})

        // ********* Get Registry Admin ****************
        try{
        let superAdmin = await didRegistryContract.getSuperAdmin()
        console.log('super admin', superAdmin)
        update('', superAdmin)
        } catch (err) {
            console.log('problem getting super admin', err)
        }

        // ********* Account Admin Status ****************
        try{
            let admins = await didRegistryContract.getAdmins()
            console.log('admins', admins)
            if(admins.includes(accountId)){
                update('', {isAdmin: true, admins: admins})
            } else {
                update('', {isAdmin: false, admins: admins})
            }
        } catch (err) {
            console.log('problem getting admins', err)
        }

        // ********* Account Verifier Status ****************
        try{
            let isVerifier = await didRegistryContract.getVerificationStatus({accountId: accountId})
            if(isVerifier){
                update('', {isVerifier: true})
            }
        } catch (err) {
            update('', {isVerifier: false})
            console.log('problem getting verification status')
        }
       

        // ******** Identity Initialization *********

        //Initiate App Ceramic Components

        const appIdx = await ceramic.getAppIdx(didRegistryContract, account)
        console.log('appidx', appIdx)

        let curUserIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, didRegistryContract)
        console.log('curuseridx', curUserIdx)

        // ********* All Announcements ****************
        try{
            let announcements = await appIdx.get('announcements', appIdx.id)
            update('', {announcements: announcements})
            console.log('announcements', announcements)
        } catch (err) {
            console.log('problem getting all announcements', err)
        }

        let did
        if (curUserIdx) {
            did = curUserIdx.id
        }
        console.log('near did', did)
        let accountType
        try{
            accountType = await didRegistryContract.getType({accountId: accountId})
        } catch (err) {
            accountType = 'none'
            console.log('account not registered, not type avail', err)
        }
        console.log('accounttype', accountType)
        let verificationStatus
        try{
            verificationStatus = await didRegistryContract.getVerificationStatus({accountId: accountId})
        } catch (err) {
            verificationStatus = false
            console.log('problem getting verification status', err)
        }

        

        // graphQL queries
        
        // determine list of current guilds (take into account those that have been deleted)
        let currentGuildsList = await queries.getGuilds()
        console.log('currentguildslist', currentGuildsList)
        let deletedGuildsList = await queries.getDeletedGuilds()
        console.log('deletedguildslist', deletedGuildsList)

        let currentActiveDaos = await updateCurrentCommunities()
        console.log('active daos', currentActiveDaos)

        let currentGuilds = await updateCurrentGuilds()
        update('',{currentGuilds, currentActiveDaos})
        
        // for(let ii = 0; ii < sortedGuilds.length; ii++){
        //     for(let jj = 0; jj < deletedGuildsList.data.deleteDIDs.length; jj++){
        //         if(currentGuildsList.data.putDIDs[ii].accountId == deletedGuildsList.data.deleteDIDs[jj].accountId){
        //             guildExists = true
        //             console.log('guildexists', guildExists)
        //             console.log('x registered', parseFloat(currentGuildsList.data.putDIDs[ii].registered))
        //             console.log('x time', parseFloat(deletedGuildsList.data.deleteDIDs[jj].time))
        //         }
        //         if(guildExists){
        //             if(parseFloat(currentGuildsList.data.putDIDs[ii].registered) > parseFloat(deletedGuildsList.data.deleteDIDs[jj].time)){
        //                 mostRecent = true
        //                 console.log('most recent', mostRecent)
        //                 console.log('here')
        //                 currentGuilds.push(currentGuildsList.data.putDIDs[ii])
        //                 console.log('currentGuilds step', currentGuilds)
        //             }
        //         }
        //     }
        //     if(!guildExists){
        //         currentGuilds.push(currentGuildsList.data.putDIDs[ii])
        //     }
        // }

        // determine list of current individuals (take into account those that have been deleted)
        let currentIndividualsList = await queries.getIndividuals()
        console.log('currentIndividualsList', currentIndividualsList)
        let deletedIndividualsList = await queries.getDeletedIndividuals()
        console.log('deletedIndiviudalslist', deletedIndividualsList)

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

        // determine list of current verifiers (take into account those that have been removed)
        let addedVerifiers = await queries.getAddedVerifiers()
        console.log('addedVerifiers', addedVerifiers)
        let removedVerifiers = await queries.getRemovedVerifiers()
        console.log('removedVerifiers', removedVerifiers)

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
                        console.log('lastindexaddverifier', lastIndexAddVerifier)
                    }
                }
                for(let x = 0; x < removedVerifiers.data.removeVerifiers.length; x++){
                    if(addedVerifiers.data.addVerifiers[lastIndexAddVerifier].accountId == removedVerifiers.data.removeVerifiers[x].accountId){
                        lastIndexDeleteVerifier = x
                        console.log('lastindexdeleteverifier', lastIndexDeleteVerifier)
                    }
                }
                console.log('at this point')
                if(lastIndexAddVerifier >= 0 && lastIndexDeleteVerifier >= 0){
                    console.log('in here')
                    if(parseFloat(addedVerifiers.data.addVerifiers[lastIndexAddVerifier].time) > parseFloat(removedVerifiers.data.removeVerifiers[lastIndexDeleteVerifier].time)) {
                        currentVerifiers.push(addedVerifiers.data.addVerifiers[lastIndexAddVerifier])
                    }
                } else {
                    console.log('or here')
                    console.log('last index add verifier', lastIndexAddVerifier)
                    if(lastIndexAddVerifier >= 0){
                        console.log('here is')
                        console.log('record', addedVerifiers.data.addVerifiers[lastIndexAddVerifier] )
                        currentVerifiers.push(addedVerifiers.data.addVerifiers[lastIndexAddVerifier])
                    }
                }
            }
        }
        console.log('currentVerifiers', currentVerifiers)

        // let currentVerifiers = []
        // let verifierExists = false
        // let mostRecentVerifier = false
        // for(let mm = 0; mm < addedVerifiers.data.addVerifiers.length; mm++){
        //     for(let nn = 0; nn < removedVerifiers.data.removeVerifiers.length; nn++){
        //         if(addedVerifiers.data.addVerifiers[mm].accountId == removedVerifiers.data.removeVerifiers[nn].accountId){
        //             verifierExists = true
        //         }
        //         if(verifierExists){
        //             if(addedVerifiers.data.addVerifiers[mm].time > removedVerifiers.data.removeVerifiers[nn].time){
        //                 mostRecentVerifier = true
        //             }
        //         }
        //     }
        //     if(!verifierExists || mostRecentVerifier){
        //         currentVerifiers.push(addedVerifiers.data.addVerifiers[mm])
        //     }
        // }

        // determine list of guilds awaiting verification
        let verifiedGuilds = await queries.getVerifiedGuilds()
        console.log('verifiedguilds', verifiedGuilds)
        let guildsAwaitingVerification = []
        let guildInList = false
        let verified = false
        for(let oo = 0; oo < currentGuildsList.data.putDIDs.length; oo++){
            for(let pp = 0; pp < verifiedGuilds.data.changeVerificationStatuses.length; pp++){
                if(currentGuildsList.data.putDIDs[oo].accountId == verifiedGuilds.data.changeVerificationStatuses[pp].accountId){
                    guildInList = true
                }
                if(guildInList){
                    if(verifiedGuilds.data.changeVerificationStatuses[pp].verified == true){
                        verified = true
                    }
                }
            }
            if(!verified){
                guildsAwaitingVerification.push(currentGuildsList.data.putDIDs[oo])
            }
        }

        update('', {
            did,
            currentGuilds,
            currentIndividuals,
            currentVerifiers,
            verificationStatus,
            guildsAwaitingVerification,
            contract,
            nftContract, 
            factoryContract, 
            didRegistryContract,
            fundingContract,
            accountType, 
            appIdx, 
            account, 
            accountId,
            curUserIdx })
        
        curUserIdx ? await synchAccountLinks(curUserIdx) : null

        finished = true

        update('', { near, wallet, finished })
    }

    finished = true

    update('', { near, wallet, finished })
}


export async function login() {
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    })
    const connection = new nearAPI.WalletConnection(near)
    connection.requestSignIn(contractName, 'Near Guilds', guildRootName)
}


export async function logout() {
    const near = await nearAPI.connect({
        networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() },
    })
    const connection = new nearAPI.WalletConnection(near)
    connection.signOut()
    window.location.replace('/')
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

// Make a Donation
export async function makeDonation(wallet, contractId, contributor, donation) {
    const daoContract = await dao.initDaoContract(wallet.account(), contractId)
    
    const donationId = await daoContract.getDonationsLength()
    const depositToken = await daoContract.getDepositToken()
    try {
        // set trigger for to log new donation
        let newDonation = get(NEW_DONATION, [])
        newDonation.push({contractId: contractId, donationId: donationId, contributor: contributor, new: true})
        set(NEW_DONATION, newDonation)

        await daoContract.makeDonation({
            args: {
                contractId: contractId,
                contributor: contributor,
                token: depositToken,
                amount: parseNearAmount(donation)
            },
            gas: GAS,
            amount: parseNearAmount(donation),
            walletMeta: 'to make a donation'
        })
    } catch (err) {
        console.log('donation failed', err)
        return false
    }
    return true
}

// Leave Community
export async function leaveCommunity(daoContract, contractId, share, accountId, entitlement, balanceAvailable) {

    try {
        // set trigger for to log member exit
        let newExit = get(NEW_EXIT, [])
        newExit.push({contractId: contractId, account: accountId, new: true, share: share})
        set(NEW_EXIT, newExit)

        // set trigger for new donation if share is not the total share
        if(share < entitlement){
          const donationId = await daoContract.getDonationsLength()
            
            // set trigger for to log new proposal
            let newDonation = get(NEW_DONATION, [])
            newDonation.push({contractId: contractId, donationId: donationId, contributor: accountId, new: true})
            set(NEW_DONATION, newDonation)
        }

        // check if this is the last member and if so, set trigger to delete the community
        let totalMembers
        try {
            totalMembers = await daoContract.getTotalMembers()
            if(totalMembers == 1){
                let communityInactivation = get(INACTIVATE_COMMUNITY, [])
                communityInactivation.push({contractId: contractId, new: true})
                set(INACTIVATE_COMMUNITY, communityInactivation)                
            }
        } catch (err) {
            console.log('no members', err)
            return false
        }
       

        await daoContract.leave({
            contractId: contractId,
            accountId: accountId,
            share: share,
            availableBalance: balanceAvailable,
            appOwner: APP_OWNER_ACCOUNT
            }, GAS)

    } catch (err) {
        console.log('leave community failed', err)
        return false
    }
    return true
}

// Delete Community
export async function inactivateCommunity(factoryContract, contractId, accountId) {

    // set trigger for new community delete
    let newInactivation = get(NEW_INACTIVATION, [])
    newInactivation.push({contractId: contractId, accountId: accountId, new: true})
    set(NEW_INACTIVATION, newInactivation)

    try{
        await factoryContract.inactivateDAO({
            contractId: contractId
            }, GAS)

    } catch (err) {
        console.log('community inactivation failed', err)
        return false
    }
    return true
}

export const hasKey = async (key, accountId, near) => {
    const keyPair = KeyPair.fromString(key)
    const pubKeyStr = keyPair.publicKey.toString()

    if (!near) {
        const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair)
        near = await nearAPI.connect({
            networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
        })
    }

    const account = new nearAPI.Account(near.connection, accountId)
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

export async function signalCounter(signalType, contractId, accountId, proposalType, near, appIdx, didRegistryContract, guildDid, factoryContract){
    let currentProperties
    let stream
    console.log('contractId here', contractId)
      console.log('guild did here', guildDid)
    let guildAccount = new nearAPI.Account(near.connection, contractId)
    let curDaoIdx = await ceramic.getUserIdx(guildAccount, appIdx, factoryContract, didRegistryContract)
    console.log('this curdaoidx here', curDaoIdx)
    switch(proposalType){
        case 'guild':
            try{
                currentProperties = await curDaoIdx.get('guildProfile', guildDid)
                console.log('currentproperties', currentProperties)
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
  console.log('proposalType', proposalType)
    let currentProperties
    let stream
    switch(proposalType){
        case 'guild':
            try{
                currentProperties = await curDaoIdx.get('guildProfile', curDaoIdx.id)
                console.log('currentproperties', currentProperties)
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


export async function spaceMint(metadata, owner) {
    let tokenId = generateId()

    await nft.nft_mint({
        token_id: tokenId,
        metadata: metadata,
        receiver_id: owner
        }, GAS)
}

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

console.log('currentGuilds', currentGuilds)
return currentGuilds
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
                console.log('count', count)
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
    console.log('copy array', copyArray)
    console.log('didMakeChange', didMakeChange)
    console.log('wasMissing', wasMissing)
    console.log('wasDuplicate', wasDuplicate)
    console.log('all accounts', allAccounts)

    if(didMakeChange || wasMissing || wasDuplicate){
        await ceramic.storeKeysSecret(curUserIdx, allAccounts, 'accountsKeys')
        set(ACCOUNT_LINKS, allAccounts)
    }
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

export async function updateCurrentCommunities() {
    let currentCommunitiesList = await queries.getAllCommunities()
    let sortedCommunities = _.sortBy(currentCommunitiesList.data.createDAOs, 'created')
    console.log('currentCommunitieslist', currentCommunitiesList)
    console.log('sortedCommunities', sortedCommunities)
    let inactivatedCommunitiesList = await queries.getAllInactivatedCommunities()
    let sortedInactivatedCommunities = _.sortBy(inactivatedCommunitiesList.data.inactivateDAOs, 'deactivated')
    console.log('inactivatedCommunitieslist', inactivatedCommunitiesList)
    console.log('sorted inactivatedCommunities', sortedInactivatedCommunities)

    let currentCommunities = []
    let lastIndexAdd
    let lastIndexDelete

    // first - start the loop to look through every one of the community entries
    for(let k = 0; k < sortedCommunities.length; k++){
        console.log('account', sortedCommunities[k].contractId)
        // make sure it hasn't already been added to the current communities list
        if(currentCommunities.filter(e => e.contractId == sortedCommunities[k].contractId).length == 0){
                for(let n = 0; n < sortedCommunities.length; n++){
                    if(sortedCommunities[k].contractId == sortedCommunities[n].contractId){
                        lastIndexAdd = n
                    }
                }
            console.log('lastIndexAdd', lastIndexAdd)
            // step 2 - get index of the last time the contractId was deleted
            for(let x = 0; x < sortedInactivatedCommunities.length; x++){
                if(sortedCommunities[lastIndexAdd].contractId == sortedInactivatedCommunities[x].contractId){
                    lastIndexDelete = x
                }
            }
            console.log('lastIndexDelete', lastIndexDelete)
            //  step 3 - if there is a last index added, compare last added with 
            //  last deleted to see if it is still an active guild.  Push it to the
            //  list of current guilds.
            if(lastIndexAdd > 0 ){
                console.log('comparison', parseFloat(sortedCommunities[lastIndexAdd].created) > parseFloat(sortedInactivatedCommunities[lastIndexDelete].deactivated))
                if(parseFloat(sortedCommunities[lastIndexAdd].created) > parseFloat(sortedInactivatedCommunities[lastIndexDelete].deactivated)) {
                    currentCommunities.push(sortedCommunities[lastIndexAdd])
                }
            }
        }
    }

console.log('currentCommunities', currentCommunities)
return currentCommunities
}

export function getStatus(flags) {
    console.log('flags', flags)
    
   /* flags [
        0: sponsored, 
        1: processed, 
        2: didPass, 
        3: cancelled,
    ]
    */
    let sponsored = flags[0]
    console.log('sponsored', sponsored)
    let processed = flags[1]
    console.log('processed', processed)
    let passed = flags[2]
    console.log('passed', passed)
    let cancelled = flags[3]
    console.log('cancelled', cancelled)

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
       console.log('combinedpersonaskills', combinedPersonaSkills)
       return combinedPersonaSkills
     } else {
        // if(persona && Object.keys(persona).length > 0){
        //     console.log('here0')
        //     for (const [key, value] of Object.entries(persona.skills)){
        //         console.log('key', key)
        //         console.log('value', value)
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
            console.log('here1')
          persona.skills.map((values, index) => {
            if(values.name){
              combinedPersonaSkills.push(values.name)
            }
          })
        }
 
        if (persona && persona.specificSkills.length > 0){
            console.log('here2')
          persona.specificSkills.map((values, index) => {
            if(values.name){
              combinedPersonaSkills.push(values.name)
            }
          })
        }
        console.log('combinedpersonaskills guild', combinedPersonaSkills)
        return combinedPersonaSkills
     }

}

export function getPrice(priceArray, date, currency){
    console.log('passed in date', date)
    console.log('passed in pricearray', priceArray)
    if(priceArray && priceArray.length > 0){
        console.log('stake here0')
        for(let a = 0; a < priceArray.length; a++){
            if(priceArray[a].date == date){
                console.log('price Array date', priceArray[a].date)
                console.log('stake here 1')
                let obj = priceArray[a].currentPrice
                console.log('stake obj', obj)
                let asArray = Object.entries(obj)
                let price = asArray.filter(([key, value]) => key == currency)
                console.log('price here', price)
                if(price){
                    return price[0][1]
                }
            }
        }
    }
    return false
}

export async function buildPriceTable(from, to, accountId){
    let appClient = await ceramic.getAppCeramic(accountId)
    let allAliases = await queries.getAliases()
    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"]

    let everyDayAlias = []
    for (let day = new Date(from); day <= new Date(to); day.setDate(day.getDate() + 1)) {
        let dayYear = new Date(day).getFullYear()
        let dayD = new Date(day).getMonth()
        let dayMonth = uniqueMonthArray[dayD]
        everyDayAlias.push(dayYear+dayMonth+'NearPriceHistory')
    }

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
    console.log('aliases', aliases)

    let thisIdx = new IDX({ ceramic: appClient, aliases: aliases})
    console.log('thisidx', thisIdx)

    let pricingArray = []
    for(let z = 0; z < aliasList.length; z++){
        let priceObject = await thisIdx.get(aliasList[z], thisIdx.id)
        console.log('priceobject', priceObject)
        if(priceObject != null){
            pricingArray = pricingArray.concat(priceObject.history)
        }
    }

    console.log('pricingArray', pricingArray)
    return pricingArray
}

export async function updateNearPriceAPI(accountId, appIdx, didRegistryContract){
    
    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    let allAliases = await queries.getAliases()

    let today = new Date()
    let to = today
    console.log('to', to)
    let t = today.getMonth()
    let todayMonth = uniqueMonthArray[t]
    let todayYear = today.getFullYear()
    let todayTimestamp = today.getTime()
    let todayFormattedDate = formatDate(todayTimestamp)
    console.log('today formatted date', todayFormattedDate)

    let existingAliases = await appIdx.get('nearPriceHistory', appIdx.id)
    console.log('existingAliases', existingAliases)

    // get all the aliases so we can create an idx with this month and year's alias
    for(let q = 0; q < allAliases.data.storeAliases.length; q++){
        if(allAliases.data.storeAliases[q].alias == todayYear+todayMonth+'NearPriceHistory'){
            yearMonthAlias = allAliases.data.storeAliases[q].definition
            console.log('inside alias', yearMonthAlias)
            break
        }
    }

    // get this month's price data stream so we can look at the last entry
    let key = todayYear+todayMonth+'NearPriceHistory'
    let alias = {[key]: yearMonthAlias}
    console.log('alias', alias)
    let appClient = await ceramic.getAppCeramic(accountId)
    let thisIdx = new IDX({ ceramic: appClient, aliases: alias})
    console.log('thisidx', thisIdx)
    let getit = await thisIdx.get(key, thisIdx.id)
    console.log('get it', getit)
    let from
    if(getit){
        let endDate = new Date(getit.history[getit.history.length-1].date)
        from = new Date(endDate.setDate(endDate.getDate() + 1))
        console.log('from', from)
    }
    if(to >= from){
        await populateNearPriceAPI(from, to, accountId, appIdx, didRegistryContract)
    }
}

export async function populateNearPriceAPI(from, to, accountId, appIdx, didRegistryContract){
    let allData = []
    let allAliases = await queries.getAliases()
    let count = 0

    for (let day = from; day <= to; day.setDate(day.getDate() + 1)) {
        if(count < 35){
            let interimDate = Date.parse(day)
            console.log('interimDate', interimDate)
            let date
            let formattedDate
            if(interimDate){
                date = formatGeckoDate(interimDate)
                formattedDate = formatDate(interimDate)
            } else {
                date = formatGeckoDate(day)
                formattedDate = formatDate(day)
            }
            console.log('formattedDate', formattedDate)
            console.log('here0')

            let getNearData = await axios.get(`https://api.coingecko.com/api/v3/coins/near/history?date=${date}`)
            console.log('getneardata', getNearData)
            if(getNearData.data.market_data){
                console.log('in here')
                let record = {
                    date: formattedDate,
                    currentPrice: getNearData.data.market_data.current_price
                }
                allData.push(record)
            }
        count++
        } else {
            console.log('allData', allData)
            await new Promise(resolve => setTimeout(resolve, 65000))
            count = 0
            day.setDate(day.getDate() - 1)
        }
    }

    // find all the unique years
    let uniqueArray = []
    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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
                let appClient = await ceramic.getAppCeramic(accountId)
                let yearMonthAlias
                console.log('month', month)
                console.log('month unique array', uniqueMonthArray[y])
                month = uniqueMonthArray[y]
                console.log('all aliases', allAliases)
                console.log('check it', uniqueArray[x]+month+'NearPriceHistory')
                for(let q = 0; q < allAliases.data.storeAliases.length; q++){
                    if(allAliases.data.storeAliases[q].alias == uniqueArray[x]+month+'NearPriceHistory'){
                        yearMonthAlias = allAliases.data.storeAliases[q].definition
                        console.log('inside alias', yearMonthAlias)
                        break
                    }
                }
                if(!yearMonthAlias){
                    console.log('why here')
                    yearMonthAlias = await ceramic.getAlias(APP_OWNER_ACCOUNT, uniqueArray[x]+month+'NearPriceHistory', appClient, yearPriceHistorySchema, uniqueArray[x]+month+' near year price history', didRegistryContract)
                }
                console.log('yearMonthAlias', yearMonthAlias)

                let existingAliases = await appIdx.get('nearPriceHistory', appIdx.id)
                console.log('existingAliases', existingAliases)
                
                if(existingAliases == null){
                    let record = {
                        history: []
                    }
                    await appIdx.set('nearPriceHistory', record)
                    existingAliases = await appIdx.get('nearPriceHistory', appIdx.id)
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
                    existingAliases.history.push([uniqueArray[x]+month+'NearPriceHistory', yearMonthAlias])
                    let first = await appIdx.set('nearPriceHistory', existingAliases)
                    console.log('history', existingAliases.history)
                }
        
               
                let key = uniqueArray[x]+month+'NearPriceHistory'
                let alias = {[key]: yearMonthAlias}
                console.log('alias', alias)
                let thisIdx = new IDX({ ceramic: appClient, aliases: alias})
                console.log('thisidx', thisIdx)
                let firstGetIt = await thisIdx.get(key, thisIdx.id)
                let entry
                if(firstGetIt && firstGetIt.history.length > 0){
                    let update = firstGetIt.history.concat(currentMonthArray)
                    entry = {
                        history: update
                    }
                } else {
                    entry = {
                        history: currentMonthArray
                    }
                }
                let second = await thisIdx.set(key, entry)
                let getit = await thisIdx.get(key, thisIdx.id)
                console.log('get it', getit)
            }
        }           
    }
}

export async function buildTransactionTable(from, to, accountId, account, factoryContract, didRegistryContract, appIdx){
    let appClient = await ceramic.getAppCeramic(accountId)
    let allAliases = await queries.getAliases()
    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"]

    let everyDayAlias = []
    console.log('from build', from)
    console.log('to build', to)
    let adjustedFrom = new Date(from)
    adjustedFrom.setDate(adjustedFrom.getDate()+1)
    let adjustedTo = new Date(to)
    adjustedTo.setDate(adjustedTo.getDate()+1)
    for (let day = adjustedFrom; day <= adjustedTo; day.setDate(day.getDate() + 1)) {
        console.log('day build', day)
        let dayYear = new Date(day).getFullYear()
        let dayD = new Date(day).getMonth()
        let dayMonth = uniqueMonthArray[dayD]
        everyDayAlias.push(dayYear+dayMonth+'NearTransactionHistory')
    }

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
    console.log('aliases', aliases)
    let thisIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, didRegistryContract, aliases)
    console.log('thisidx', thisIdx)
    // let thisIdx = new IDX({ ceramic: appClient, aliases: aliases})
    // console.log('thisidx', thisIdx)

    let transactionArray = []
    for(let z = 0; z < aliasList.length; z++){
        let transactionObject = await thisIdx.get(aliasList[z], thisIdx.id)
        console.log('transactionObject', transactionObject)
        if(transactionObject != null){
            transactionArray = transactionArray.concat(transactionObject.history)
        }
    }

    console.log('transactionArray', transactionArray)
    return transactionArray
}

export async function updateNearTransactionAPI(accountId, appIdx, factoryContract, didRegistryContract, account){
    
    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    let allAliases = await queries.getAliases()

    let today = new Date()
    let to = today
    console.log('to', to)
    let t = today.getMonth()
    let todayMonth = uniqueMonthArray[t]
    let todayYear = today.getFullYear()
    let todayTimestamp = today.getTime()
    let todayFormattedDate = formatDate(todayTimestamp)
    console.log('today formatted date', todayFormattedDate)

    let existingAliases = await appIdx.get('nearTransactionHistory', appIdx.id)
    console.log('existingAliases', existingAliases)

    // get all the aliases so we can create an idx with this month and year's alias
    for(let q = 0; q < allAliases.data.storeAliases.length; q++){
        if(allAliases.data.storeAliases[q].alias == todayYear+todayMonth+'NearTransactionHistory'){
            yearMonthAlias = allAliases.data.storeAliases[q].definition
            console.log('inside alias', yearMonthAlias)
            break
        }
    }

    // get this month's transaction data stream so we can look at the last entry
    let key = todayYear+todayMonth+'NearTransactionHistory'
    let alias = {[key]: yearMonthAlias}
    console.log('alias', alias)
    //let appClient = await ceramic.getAppCeramic(accountId)
    let thisIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, didRegistryContract, alias)
    console.log('thisidx', thisIdx)
    // let thisIdx = new IDX({ ceramic: appClient, aliases: alias})
    // console.log('thisidx', thisIdx)
    let getit = await thisIdx.get(key, thisIdx.id)
    console.log('get it', getit)
    let from
    if(getit){
        let endDate = new Date(getit.history[getit.history.length-1].date)
        from = new Date(endDate.setDate(endDate.getDate() + 1))
        console.log('from', from)
    } 
    if(!from){
        from = new Date('October 1, 2020 00:00:01')
    }
    if(to.getTime() >= from.getTime()){
        await populateNearTransactionAPI(from, to, accountId, appIdx, factoryContract, didRegistryContract, account)
    }
}

export async function populateNearTransactionAPI(from, to, accountId, appIdx, factoryContract, didRegistryContract, account){
    console.log('from pop', from)
    console.log('to pop', to)
    const uniqueMonthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    let appClient = await ceramic.getAppCeramic(accountId)

    let allData = []
    let allAliases = await queries.getAliases()

    // find last month that has data
    
    let exists = false
    let startDate = new Date()

    let lastTime
    while(!exists){
        let currentYear = startDate.getFullYear()
        let currentMonth = uniqueMonthArray[startDate.getMonth()]
        let key = currentYear+currentMonth+'NearTransactionHistory'
       
        let firstAlias
        for(let h = 0; h < allAliases.data.storeAliases.length; h++){
            if(allAliases.data.storeAliases[h].alias == key){
                firstAlias = allAliases.data.storeAliases[h].definition
                break
            }
        }

        let alias = {[key]: firstAlias}
        console.log('alias', alias)
        let thisIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, didRegistryContract, alias)
        console.log('thisidx', thisIdx)
        // let thisIdx = new IDX({ ceramic: appClient, aliases: alias})
        // console.log('thisidx', thisIdx)
        let transData = await thisIdx.get(key, thisIdx.id)
        console.log('transData', transData)
        // get last month and year
        if(transData && transData.history.length > 0){
            lastTime = new Date(transData.history[0].transaction.block_timestamp/1000000)
            exists = true
        }
        
        if(startDate.getTime() <= new Date('October 1, 2020 00:00:01').getTime()){
            lastTime = new Date('October 1, 2020 00:00:01')
            exists = true
        }

        startDate.setDate(startDate.getDate() - 30) 
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
                    yearMonthAlias = await ceramic.getAlias(APP_OWNER_ACCOUNT, uniqueArray[x]+month+'NearTransactionHistory', appClient, yearTransactionHistorySchema, uniqueArray[x]+month+' near year transaction history', didRegistryContract)
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
                let thisIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, didRegistryContract, alias)
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