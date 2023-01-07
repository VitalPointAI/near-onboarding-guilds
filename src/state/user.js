import * as nearAPI from 'near-api-js'
import { get, set, del } from '../utils/storage'
import { APP_OWNER_ACCOUNT, ceramic } from '../utils/ceramic'
import { registry } from '../utils/registry'
import { factory } from '../utils/factory'
import { nft } from '../utils/nft'
import { funding } from '../utils/funding'
import { catalystDao } from '../utils/catalystDao'
import { isVerified, synchAccountLinks, hasKey } from '../utils/helpers'
import { config } from './config'

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
    helperUrl,
    walletUrl, 
    nameSuffix, 
    nftFactorySuffix, 
    explorerUrl,
    contractName, 
    registryContractName,
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
    Contract,
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

export const initUser = () => async ({ update, getState, dispatch }) => {
    
    let state = getState()
    console.log('state inituser start', state)

    const {
        near,
        admins,
        appIdx
    } = state.app

    // initiate wallet
    const wallet = new WalletConnection(near)
    update('user', {wallet})

    wallet.signIn = () => {
        wallet.requestSignIn({
            contractId: contractName,
            title: 'Guilds',
        })
        window.location.assign('/')
    }    

    // initiate global contracts for this user
    const walletContract = new Contract(wallet.account(), contractName, {
        changeMethods: ['send'],
    })
    const registryContract = await registry.initiateregistryContract(wallet.account())
    const factoryContract = await factory.initFactoryContract(wallet.account())
    const nftContract = await nft.initNFTContract(wallet.account())
    const fundingContract = await funding.initFundingContract(wallet.account())
    const catalystContract = await catalystDao.initDaoContract(wallet.account())
    update('user', {walletContract, registryContract, factoryContract, nftContract, fundingContract, catalystContract})
    
    wallet.signedIn = wallet.isSignedIn()

    if(wallet.signedIn){

        wallet.balance = formatNearAmount((await wallet.account().getAccountBalance()).available, 2)
        update('user', {signedIn: wallet.signedIn, balance: wallet.balance})

        // ********* Initiate wallet account ************

        const account = wallet.account()

        // confirm key exists
        try{
            let keyExists = await hasKey(account)
            update('user', {keyExists})
        } catch (err) {
            console.log('problem confirming key exists', err)
        }

        const accountId = account.accountId
        update('user', {account, accountId})

        // ******** Account Type *********
        try{
            let accountType = await registryContract.getType({accountId: accountId})
            update('user', {accountType})
        } catch (err) {
            update('user', {accountType: 'none'})
            console.log('account not registered, no type avail', err)
        }

        // ********* Account Admin Status ****************
        try{          
            if(admins.includes(accountId)){
                update('user', {isAdmin: true})
            } else {
                update('user', {isAdmin: false})
            }
        } catch (err) {
            console.log('problem getting admin status', err)
        }

        // ********* Account Verification Status ****************
        try{
            let isVerified = await isVerified(accountId)
            if(isVerified){
                update('user', {isVerified: true})
            }
        } catch (err) {
            update('', {isVerified: false})
            console.log('problem getting verification status')
        }

        // ********* Account Verifier Status ****************
        try{
            let isVerifier = await registryContract.getVerificationStatus({accountId: accountId})
            if(isVerifier){
                update('user', {isVerifier: true})
            }
        } catch (err) {
            update('', {isVerifier: false})
            console.log('problem getting verifier status')
        }
       
        // ******** Identity Initialization *********
        try{
            let curUserIdx = await ceramic.getUserIdx(account, appIdx, factoryContract, registryContract)
            curUserIdx ? await synchAccountLinks(curUserIdx) : null
            update('user', {curUserIdx, did: curUserIdx.id})
        } catch (err) {
            console.log('problem getting curuseridx and did', err)
        }

        // ********* NEAR Account Transactions Update ************
        try{
            await updateNearTransactionAPI(accountId, appIdx, factoryContract, registryContract, account, update)
        } catch (err) {
            console.log('problem updating user near transactions', err)
        }

        // Admin Functions
        // ********* Clear User's Ceramic Transaction Data ****************
        // await clearCeramicTransactionData(account, appIdx, factoryContract, registryContract)
        
        update('user', {userInitialized: true})
        console.log('state inituser finished', state)

    }
}

