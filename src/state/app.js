import { State } from '../utils/state'
import { initUser, hasKey } from './user'
import * as nearAPI from 'near-api-js'
import { registry } from '../utils/registry'
import { ceramic } from '../utils/ceramic'
import { config } from './config'
import { 
    updateCurrentGuilds, 
    updateCurrentCommunities, 
    getGuildsAwaitingVerification, 
    getCurrentVerifiers, 
    getCurrentIndividuals } from '../utils/helpers'

export const {
    APP_OWNER_ACCOUNT,
    networkId,
    nodeUrl,
    walletUrl,
    helperUrl,
    explorerUrl
} = config

const initialState = {
	app: {
        mounted: false,
        appIdx: null,
        near: null,
        appRregistryContract: null,
        ceramicClient: null,
        appAccount: null,
        superAdmin: null,
        admins: [],
        announcements: [],
        isUpdated: false,
        currentGuilds: [], 
        currentCommunities: [], 
        guildsAwaitingVerification: [],
        currentVerifiers: [],
        currentIndividuals: []
    },
    user: {
        userInitialized: false,
        curUserIdx: null,
        did: null,
        isVerifier: false,
        isVerified: false,
        isAdmin: false,
        accountType: 'none',
        account: null,
        accountId: null,
        signedIn: false,
        balance: null,
        wallet: null,
        walletContract: null, 
        registryContract: null, 
        factoryContract: null, 
        nftContract: null, 
        fundingContract: null,
        catalystContract: null,
        keyExists: false
    }
}

export const { appStore, AppProvider } = State(initialState, 'app')

const { connect, keyStores } = nearAPI

export const onAppMount = () => async ({ update, getState, dispatch }) => {
    
    update('app', { mounted: true })

    const ceramicClient = await ceramic.getAppCeramic(APP_OWNER_ACCOUNT)

    update('app', {ceramicClient})

    const appKeyStore = new keyStores.BrowserLocalStorageKeyStore()

    const connectionConfig = {
    networkId: networkId,
    keyStore: appKeyStore,
    nodeUrl: nodeUrl,
    walletUrl: walletUrl,
    helperUrl: helperUrl,
    explorerUrl: explorerUrl,
    }

    const near = await connect(connectionConfig);
    
    update('app', {near})

    const appAccount = await near.account(APP_OWNER_ACCOUNT)

    const appRegistryContract = await registry.initiateregistryContract(appAccount)
    
    const appIdx = await ceramic.getAppIdx(appRegistryContract, appAccount)

    update('app', {appAccount, appRegistryContract, appIdx })

    try{
        let nearPriceUpdate = await updateNearPriceAPI(APP_OWNER_ACCOUNT, appIdx, registryContract, update)
    } catch (err) {
        console.log('problem updating NEAR price history')
    }

    // ********* Get Registry Admin ****************
    try{
        let superAdmin = await appRegistryContract.getSuperAdmin()
        update('app', {superAdmin})
        } catch (err) {
            console.log('problem getting super admin', err)
        }

    // ********* Account Admin Status ****************
    try{
        let admins = await appRegistryContract.getAdmins()
        update('app', {admins})
    } catch (err) {
        console.log('problem getting admins', err)
    }

    // ********* All Announcements ****************
    try{
        let announcements = await appIdx.get('announcements', appIdx.id)
        update('app', {announcements})
    
    } catch (err) {
        console.log('problem getting all announcements', err)
    }

    // ********* GraphQL Queries ****************

    let currentVerifiers = await getCurrentVerifiers()
    let currentIndividuals = await getCurrentIndividuals()
    let currentCommunities = await updateCurrentCommunities()
    let currentGuilds = await updateCurrentGuilds()
    let guildsAwaitingVerification = await getGuildsAwaitingVerification()
    update('app', {
        currentGuilds, 
        currentCommunities, 
        guildsAwaitingVerification,
        currentIndividuals,
        currentVerifiers
    })

    // Admin Functions (to move to admin page at some point)
    // ********* Clear Ceramic Price Data****************
    //  await clearCeramicPriceData(appIdx)

    // ********* Initialize Registry/Funding Contract****************
    //  let thisAllowance = parseNearAmount('2')
    //  await appRegistryContract.init({
    //     adminId: 'vitalpointai.testnet',
    //     fundingPublicKey: '',
    //     allowance: thisAllowance})
    //  await fundingContract.init({adminId: 'vitalpointai.testnet'})



    // if (key && accountId) {
     
    //     const { seedPhrase, publicKey } = generateSeedPhrase()
    //     const keyExists = await hasKey(key, accountId)
    //     update('accountData', { key, from, message, link, accountId, seedPhrase, publicKey, keyExists, owner })

    //     // set temporary key - remains until it's changed on the user's next login
    //     set('near-api-js:keystore:'+accountId+':'+near.connection.networkId, key)

    // } else {
        dispatch(initUser())
   // }
}
