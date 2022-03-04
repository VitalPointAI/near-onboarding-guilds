import * as nearAPI from 'near-api-js'
import { get, set, del } from '../utils/storage'
import { APP_OWNER_ACCOUNT, ceramic } from '../utils/ceramic'
import { registry } from '../utils/registry'
import { config } from './config'
import { factory } from '../utils/factory'
import { nft } from '../utils/nft'
import { funding } from '../utils/funding'
import { queries } from '../utils/graphQueries'

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
    rootName,
    MAIL_URL,
    AUTH_TOKEN,
    SENDY_API_KEY_CALL,
    FUNDING_SEED_CALL
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

        let keyPair = await near.connection.signer.keyStore.getKey(networkId, accountId)
        let pKey = keyPair.getPublicKey().toString().split(':')[1]
        update('', {pKey: pKey})

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

        const appIdx = await ceramic.getAppIdx(didRegistryContract, account, pKey)
        console.log('appidx', appIdx)

        let curUserIdx = await ceramic.getUserIdx(account, appIdx, near, factoryContract, didRegistryContract)
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

        let accountType
        try{
            accountType = await didRegistryContract.getType({accountId: accountId})
        } catch (err) {
            accountType = 'not registered'
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

        // let allMints = await queries.getAllMints()
        // console.log('allMints', allMints)
        // let allTransfers = await queries.getAllTransfers()
        // console.log('allTransfers', allTransfers)

        // determine list of current guilds (take into account those that have been deleted)
        let currentGuildsList = await queries.getGuilds()
        console.log('currentguildslist', currentGuildsList)
        let deletedGuildsList = await queries.getDeletedGuilds()
        console.log('deletedguildslist', deletedGuildsList)

        let currentGuilds = []
        let guildExists = false
        let mostRecent = false
        let lastIndexAdd
        let lastIndexDelete
        for(let m = 0; m < currentGuildsList.data.putDIDs.length; m++){
            guildExists = false
            for(let z = 0; z < currentGuilds.length; z++){
                if(currentGuildsList.data.putDIDs[m].accountId == currentGuilds[z].accountId)
                guildExists = true
                console.log('m', m)
                console.log('z', z)
                console.log('guild exists', guildExists)
            }
            if(!guildExists){
                for(let n = 0; n < currentGuildsList.data.putDIDs.length; n++){
                    if(currentGuildsList.data.putDIDs[m].accountId == currentGuildsList.data.putDIDs[n].accountId){
                        lastIndexAdd = n
                        console.log('lastindexadd', lastIndexAdd)
                    }
                }
                for(let x = 0; x < deletedGuildsList.data.deleteDIDs.length; x++){
                    if(currentGuildsList.data.putDIDs[lastIndexAdd].accountId == deletedGuildsList.data.deleteDIDs[x].accountId){
                        lastIndexDelete = x
                        console.log('lastindexdelete', lastIndexDelete)
                    }
                }
                if(lastIndexAdd > 0){
                    if(parseFloat(currentGuildsList.data.putDIDs[lastIndexAdd].registered) > parseFloat(deletedGuildsList.data.deleteDIDs[lastIndexDelete].time)) {
                        currentGuilds.push(currentGuildsList.data.putDIDs[lastIndexAdd])
                        console.log('currentGuilds compare', currentGuilds)
                    }
                } else {
                    currentGuilds.push(currentGuildsList.data.putDIDs[m])
                    console.log('currentGuilds', currentGuilds)
                }
            }
            
        }
       
        console.log('currentGuilds', currentGuilds)

        
        // for(let ii = 0; ii < currentGuildsList.data.putDIDs.length; ii++){
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
        
        if(curUserIdx){
            // check localLinks, see if they're still valid
            let state = getState()

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
                        if(count > 1) copyArray.splice(r,1)
                        wasDuplicate = true
                    }
                    r++
                }
                z++
            }

            if(didMakeChange || wasMissing || wasDuplicate){
                await ceramic.storeKeysSecret(curUserIdx, allAccounts, 'accountsKeys')
                set(ACCOUNT_LINKS, allAccounts)
            }
        }

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
    connection.requestSignIn(contractName, 'Space Gem', rootName)
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

export function formatDateString(timestamp){
    if(timestamp){
        let stringDate = timestamp.toString()
        let options = {year: 'numeric', month: 'long', day: 'numeric'}
        return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
    } else {
        return null
    } 
}

export async function signal(signalType, curDaoIdx, accountId, proposalType){
  console.log('proposalType', proposalType)
    let currentProperties
    let stream
    switch(proposalType){
        case 'guild':
            try{
                currentProperties = await curDaoIdx.get('daoProfile', curDaoIdx.id)
                console.log('currentproperties', currentProperties)
                stream = 'daoProfile'
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