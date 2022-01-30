import * as nearAPI from 'near-api-js'
import { get, set, del } from '../utils/storage'
import { APP_OWNER_ACCOUNT, ceramic } from '../utils/ceramic'
import { registry } from '../utils/registry'
import { config } from './config'
import { factory } from '../utils/factory'
import { nft } from '../utils/nft'
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
    REGISTRY_API_URL, FIRST_TIME
} = config

export const {
    KeyPair,
    InMemorySigner,
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
    console.log('near', near)
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
            title: 'Space Gem',
        })
        window.location.assign('/')
    }

    wallet.signedIn = wallet.isSignedIn()
    if (wallet.signedIn) {
        wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 2)
    }

    const contract = new nearAPI.Contract(wallet.account(), contractName, {
        changeMethods: ['send', 'create_account', 'create_account_and_claim'],
    })

    // initiate global contracts
    const didRegistryContract = await registry.initiateDidRegistryContract(wallet.account())
    const factoryContract = await factory.initFactoryContract(wallet.account())
    const nftContract = await nft.initNFTContract(wallet.account())
    
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

        // ********* Initialize Registry Contract****************
        //await didRegistryContract.init({adminId: 'vitalpointai.testnet'})

        // ********* Get Registry Admin ****************
        let admin = await didRegistryContract.getAdmin()
        console.log('admin', admin)
        // ******** Identity Initialization *********

        //Initiate App Ceramic Components

        const appIdx = await ceramic.getAppIdx(didRegistryContract, account, near)
        console.log('appidx', appIdx)
        let curUserIdx = await ceramic.getUserIdx(account, appIdx, near, factoryContract, didRegistryContract)
        console.log('curuseridx', curUserIdx)
        
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

        let verificationStatus
        try{
            verificationStatus = await didRegistryContract.getVerificationStatus({accountId: accountId})
        } catch (err) {
            verificationStatus = false
            console.log('problem getting verification status', err)
        }

        // graphQL queries
        let currentGuildsList = await queries.getGuilds()
        console.log('currentguildslist', currentGuildsList)
        let currentIndividualsList = await queries.getIndividuals()
        console.log('currentIndividualsList', currentIndividualsList)

        update('', { 
            admin, 
            did,
            currentGuildsList,
            currentIndividualsList,
            verificationStatus, 
            nftContract, 
            factoryContract, 
            didRegistryContract, 
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
    connection.requestSignIn(contractName, 'Space Gem')
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

export async function signal(proposalId, signalType, curDaoIdx, accountId, proposalType){
  
    let currentProperties
    let stream
    switch(proposalType){
        case 'Tribute':
            try{
                currentProperties = await curDaoIdx.get('tributeProposalDetails', curDaoIdx.id)
                stream = 'tributeProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving tribute proposal details', err)
            }
           
        case 'Commitment':
            try{
                currentProperties = await curDaoIdx.get('fundingProposalDetails', curDaoIdx.id)
                stream = 'fundingProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving funding commitment proposal details', err)
            }
            
        case 'Member':
            try{
                currentProperties = await curDaoIdx.get('memberProposalDetails', curDaoIdx.id)
                stream = 'memberProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving member proposal details', err)
            }
        case 'GuildKick':
            try{
                currentProperties = await curDaoIdx.get('guildKickProposalDetails', curDaoIdx.id)
                stream = 'guildKickProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving guild kick proposal details', err)
            }
        case 'Payout':
            try{
                currentProperties = await curDaoIdx.get('payoutProposalDetails', curDaoIdx.id)
                stream = 'payoutProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving payout proposal details', err)
            }
        case 'Configuration':
            try{
                currentProperties = await curDaoIdx.get('configurationProposalDetails', curDaoIdx.id)
                stream = 'configurationProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving configuration proposal details', err)
            }
        case 'CommunityRole':
            try{
                currentProperties = await curDaoIdx.get('communityRoles', curDaoIdx.id)
                stream = 'communityRoles'
                break
            } catch (err) {
                console.log('problem retrieving configuration proposal details', err)
            }
        case 'ReputationFactor':
            try{
                currentProperties = await curDaoIdx.get('reputationFactors', curDaoIdx.id)
                stream = 'reputationFactors'
                break
            } catch (err) {
                console.log('problem retrieving reputation factor proposal details', err)
            }
        case 'Opportunity':
            try{
                currentProperties = await curDaoIdx.get('opportunities', curDaoIdx.id)
                stream = 'opportunities'
                break
            } catch (err) {
                console.log('problem retrieving opportunity proposal details', err)
            }
        case 'CancelCommit':
            try{
                currentProperties = await curDaoIdx.get('cancelCommitmentProposalDetails', curDaoIdx.id)
                stream = 'cancelCommitmentProposalDetails'
                break
            } catch (err) {
                console.log('problem retrieving cancel commitment proposal details', err)
            }
        default:
            break
    }   
  
    let hasLiked = false
    let hasDisLiked = false
    let hasNeutral = false
    if(stream == 'opportunities'){
        let i = 0
    while (i < currentProperties.opportunities.length){
        
        if(currentProperties.opportunities[i].opportunityId == proposalId.toString()){
            let proposalToUpdate = currentProperties.opportunities[i]
            hasLiked = proposalToUpdate.likes.includes(accountId)
            hasDisLiked = proposalToUpdate.dislikes.includes(accountId)
            hasNeutral = proposalToUpdate.neutrals.includes(accountId)

            if(signalType == 'like' && !hasLiked){
                proposalToUpdate.likes.push(accountId)
             
                if(hasDisLiked){
                    let k = 0
                    while (k < proposalToUpdate.dislikes.length){
                        if(proposalToUpdate.dislikes[k] == accountId){
                            proposalToUpdate.dislikes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasNeutral){
                    let k = 0
                    while (k < proposalToUpdate.neutrals.length){
                        if(proposalToUpdate.neutrals[k] == accountId){
                            proposalToUpdate.neutrals.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }

            if(signalType == 'dislike' && !hasDisLiked){
                proposalToUpdate.dislikes.push(accountId)
                if(hasLiked){
                    let k = 0
                    while (k < proposalToUpdate.likes.length){
                        if(proposalToUpdate.likes[k] == accountId){
                            proposalToUpdate.likes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasNeutral){
                    let k = 0
                    while (k < proposalToUpdate.neutrals.length){
                        if(proposalToUpdate.neutrals[k] == accountId){
                            proposalToUpdate.neutrals.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }

            if(signalType == 'neutral' && !hasNeutral){
                proposalToUpdate.neutrals.push(accountId)
                if(hasLiked){
                    let k = 0
                    while (k < proposalToUpdate.likes.length){
                        if(proposalToUpdate.likes[k] == accountId){
                            proposalToUpdate.likes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasDisLiked){
                    let k = 0
                    while (k < proposalToUpdate.dislikes.length){
                        if(proposalToUpdate.dislikes[k] == accountId){
                            proposalToUpdate.dislikes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }
        currentProperties.opportunities[i] = proposalToUpdate
        break
        }
    i++
    }

    try{
        await curDaoIdx.set(stream, currentProperties)
    } catch (err) {
        console.log('error with signalling', err)
    } 
} else {
    let i = 0
    while (i < currentProperties.proposals.length){
        
        if(currentProperties.proposals[i].proposalId == proposalId.toString()){
            let proposalToUpdate = currentProperties.proposals[i]
            hasLiked = proposalToUpdate.likes.includes(accountId)
            hasDisLiked = proposalToUpdate.dislikes.includes(accountId)
            hasNeutral = proposalToUpdate.neutrals.includes(accountId)

            if(signalType == 'like' && !hasLiked){
                proposalToUpdate.likes.push(accountId)
               
                if(hasDisLiked){
                    let k = 0
                    while (k < proposalToUpdate.dislikes.length){
                        if(proposalToUpdate.dislikes[k] == accountId){
                            proposalToUpdate.dislikes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasNeutral){
                    let k = 0
                    while (k < proposalToUpdate.neutrals.length){
                        if(proposalToUpdate.neutrals[k] == accountId){
                            proposalToUpdate.neutrals.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }

            if(signalType == 'dislike' && !hasDisLiked){
                proposalToUpdate.dislikes.push(accountId)
                if(hasLiked){
                    let k = 0
                    while (k < proposalToUpdate.likes.length){
                        if(proposalToUpdate.likes[k] == accountId){
                            proposalToUpdate.likes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasNeutral){
                    let k = 0
                    while (k < proposalToUpdate.neutrals.length){
                        if(proposalToUpdate.neutrals[k] == accountId){
                            proposalToUpdate.neutrals.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }

            if(signalType == 'neutral' && !hasNeutral){
                proposalToUpdate.neutrals.push(accountId)
                if(hasLiked){
                    let k = 0
                    while (k < proposalToUpdate.likes.length){
                        if(proposalToUpdate.likes[k] == accountId){
                            proposalToUpdate.likes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
                if(hasDisLiked){
                    let k = 0
                    while (k < proposalToUpdate.dislikes.length){
                        if(proposalToUpdate.dislikes[k] == accountId){
                            proposalToUpdate.dislikes.splice(k,1)
                            break
                        }
                    k++
                    }
                }
            }
        currentProperties.proposals[i] = proposalToUpdate
        break
        }
    i++
    }

    try{
        await curDaoIdx.set(stream, currentProperties)
    } catch (err) {
        console.log('error with signalling', err)
    }
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