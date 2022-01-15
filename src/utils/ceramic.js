import CeramicClient from '@ceramicnetwork/http-client'
import * as nearApiJs from 'near-api-js'
import { get, set, del } from './storage'
import { IDX } from '@ceramicstudio/idx'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { createDefinition, publishSchema } from '@ceramicstudio/idx-tools'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyDidResolver from 'key-did-resolver'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import ThreeIdProvider from '3id-did-provider'
import { DID } from 'dids'

// schemas
import { profileSchema } from '../schemas/profile'
import { accountKeysSchema } from '../schemas/accountKeys'
import { definitionsSchema } from '../schemas/definitions'
import { schemaSchema } from '../schemas/schemas'
import { commentsSchema } from '../schemas/comments'
import { notificationSchema } from '../schemas/notifications'

import { config } from '../state/config'

const axios = require('axios').default

export const {
    FUNDING_DATA, FUNDING_DATA_BACKUP, SEEDS, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, REDIRECT, 
    KEY_REDIRECT, APP_OWNER_ACCOUNT, IPFS_PROVIDER, FACTORY_DEPOSIT, CERAMIC_API_URL, APPSEED_CALL, 
    networkId, nodeUrl, walletUrl, nameSuffix,
    contractName, didRegistryContractName, factoryContractName,
    TOKEN_CALL, AUTH_TOKEN, ALIASES
} = config

const {
  keyStores: { InMemoryKeyStore },
  Near, Account, Contract, KeyPair, InMemorySigner,
  utils: {
    format: {
      parseNearAmount
    }
  }
} = nearApiJs


class Ceramic {

  async storeKeysSecret(idx, payload, key, did) {

    let record = await idx.get(key)
    
    if(!record){
      record = { seeds: [] }
    }
    
    let access = [idx._ceramic.did.id]
    if(did) access.push(did)
    const jwe = await idx._ceramic.did.createDagJWE(payload, access)
  
    record = { seeds: [jwe] }
    try{
    await idx.set(key, record)
    return true
    } catch (err) {
      console.log('error setting keys records', err)
      return false
    }
  }


  async downloadKeysSecret(idx, key) {
    let records = await idx.get(key)
   
    if(records && Object.keys(records).length != 0){
      return await idx._ceramic.did.decryptDagJWE(records.seeds[0])
    }
    return []
  }


  async getLocalAccountSeed(account, appIdx, contract){

    let newAccountKeys =  await this.downloadKeysSecret(appIdx, 'accountsKeys')

    // add legacy dao keys
    let legacyAppIdx = await this.getLegacyAppIdx(contract, account)
    let oldAccountKeys =  await this.downloadKeysSecret(legacyAppIdx, 'accountsKeys')
    let localAccounts = get(ACCOUNT_LINKS, [])
    let accounts = localAccounts.concat(oldAccountKeys, newAccountKeys)
    
    if(accounts && accounts.length > 0){
      let i = 0
      while (i < accounts.length){
        if(accounts[i].accountId == account.accountId){
          let seed = Buffer.from((accounts[i].key).slice(0,32))
          return seed
        }
        i++
      }
    } 
    return false
  }


  async makeSeed(account){
      let keyPair = KeyPair.fromRandom('ed25519')
      let publicKey = keyPair.getPublicKey().toString().split(':')[1]
      let owner = account.accountId
      const links = get(ACCOUNT_LINKS, [])
      let c = 0
      let accountExists
      while(c < links.length) {
          if(links[c].accountId == account.accountId){
              accountExists = true
              links[c] = { key: keyPair.secretKey, publicKey: publicKey, accountId: account.accountId, owner: owner, keyStored: Date.now() }
              set(ACCOUNT_LINKS, links)
              break
          } else {
              accountExists = false
          }
      c++
      }
      if(!accountExists){
        links.push({ key: keyPair.secretKey, publicKey: publicKey, accountId: account.accountId, owner: owner, keyStored: Date.now() })
        set(ACCOUNT_LINKS, links)
      }
  }


  async getCeramic(account, seed) {
    if (seed == undefined || seed == false){
      seed = await this.getLocalAccountSeed(account.accountId)
      if(seed == false || seed == undefined){
        await this.makeSeed(account)
        seed = await this.getLocalAccountSeed(account.accountId)
      }
    }
    const ceramic = new CeramicClient(CERAMIC_API_URL, {cacheDocCommits: true, docSyncEnabled: false, docSynchInterval: 30000})
    const authId = 'NearAuthProvider'
    let authSecret = seed
    const getPermission = async (request) => {
       return request.payload.paths
    }

    const threeId = await ThreeIdProvider.create({
      ceramic,
      getPermission,
      authSecret,
      authId
    })
   
    const provider = threeId.getDidProvider()
   
    const resolver = {...KeyDidResolver.getResolver(), ...ThreeIdResolver.getResolver(ceramic)}
    const did = new DID({ resolver })
    ceramic.setDID(did)
    ceramic.did.setProvider(provider)
    await ceramic.did.authenticate()
    return ceramic
  }


  async getLegacyCeramic(account, seed) {
    if (seed == undefined || seed == false){
      seed = await this.getLocalAccountSeed(account.accountId)
      if(seed == false || seed == undefined){
        await this.makeSeed(account)
        seed = await this.getLocalAccountSeed(account.accountId)
      }
    }
    const ceramic = new CeramicClient(CERAMIC_API_URL, {cacheDocCommits: true, docSyncEnabled: false, docSynchInterval: 30000})
   
    const provider = new Ed25519Provider(seed)

    const resolver = {...KeyDidResolver.getResolver()}
  
    const did = new DID({ resolver })
    
    ceramic.setDID(did)
    ceramic.did.setProvider(provider)
  
    await ceramic.did.authenticate()
    
    return ceramic
  }


  async getAppCeramic(accountId) {

    let existingToken = get(AUTH_TOKEN, [])
    if(!existingToken.length > 0){
    
    let token = await axios.post(TOKEN_CALL, 
      {
      accountId: accountId
      }    
    )
    
    set(AUTH_TOKEN, token.data.token)
    }

    let authToken = get(AUTH_TOKEN, [])   
    let retrieveSeed = await axios.post(APPSEED_CALL, {
      // ...data
    },{
      headers: {
        'Authorization': `Basic ${authToken}`
      }
    })
 
    const ceramic = new CeramicClient(CERAMIC_API_URL)
  
    let authSecret = retrieveSeed.data.seed

    const authId = 'NearAuthProvider'

    const getPermission = async (request) => {
       return request.payload.paths
    }

    const threeId = await ThreeIdProvider.create({
      ceramic,
      getPermission,
      authSecret,
      authId
    })
    
    const provider = threeId.getDidProvider()
   
    const resolver = {
      ...KeyDidResolver.getResolver(),
      ...ThreeIdResolver.getResolver(ceramic)
    }
    const did = new DID({ resolver })
    
    ceramic.setDID(did)
    ceramic.did.setProvider(provider)
    await ceramic.did.authenticate()
    
    return ceramic
  }


  // needed to find accounts that had been registered with key did provider
  async getLegacyAppCeramic(accountId) {

    let existingToken = get(AUTH_TOKEN, [])
    if(!existingToken.length > 0){
    
    let token = await axios.post(TOKEN_CALL, 
      {
      accountId: accountId
      }    
    )
    
    set(AUTH_TOKEN, token.data.token)
    }

    let authToken = get(AUTH_TOKEN, [])   
    let retrieveSeed = await axios.post(APPSEED_CALL, {
      // ...data
    },{
      headers: {
        'Authorization': `Basic ${authToken}`
      }
    })
 
    const ceramic = new CeramicClient(CERAMIC_API_URL)
    const provider = new Ed25519Provider(retrieveSeed.data.seed)

    const resolver = {...KeyDidResolver.getResolver()}
  
    const did = new DID({ resolver })
    
    ceramic.setDID(did)
    ceramic.did.setProvider(provider)
  
    await ceramic.did.authenticate()
    
    return ceramic
  }


  async associateAppDID(accountId, contract, ceramic) {
    /** Try and retrieve did from  contract if it exists */
      let did
        let didPresent = await contract.hasDID({accountId: accountId})
          if(didPresent) {   
          try {
              did = await contract.getDID({accountId: accountId});
              if(did) {
                return did
              }           
          } catch (err) {
              console.log('no DID retrievable', err)
          }
        }

        /** No DID, so create a new one and store it in the contract */
        if (ceramic.did.id) {
          try{
            did = await contract.putDID({
                accountId: accountId,
                did: ceramic.did.id
            }, GAS)
          } catch (err) {
            console.log('problem storing DID', err)
          }
        }
      return did
  }


  async changeDefinition(accountId, aliasName, client, schema, description, contract) {
  
    let alias
  
      let aliasExists = await contract.hasAlias({alias: accountId+':'+aliasName})
    
      if(aliasExists){
        try{
          alias = await contract.retrieveAlias({alias: accountId+':'+aliasName})
        
        } catch (err) {
          console.log('alias is misformed', err)
          alias = false
        }
      } 
      
      let newSchemaURL = await publishSchema(client, {content: schema})
      const doc = await TileDocument.load(client, alias)
    
      try {
        await doc.update({name: aliasName, description: description, schema: newSchemaURL.commitId.toUrl()})
        return true
      } catch (err) {
        console.log('error updating definition schema', err)
        return false
      }
  }


  async getAlias(accountId, aliasName, client, schema, description, contract) {
    let alias
    try {
      let aliasExists = await contract.hasAlias({alias: accountId+':'+aliasName})
      if(aliasExists){
        try{
          alias = await contract.retrieveAlias({alias: accountId+':'+aliasName})
        return alias
        } catch (err) {
          console.log('alias is misformed', err)
          alias = false
        }
      }
      if(!aliasExists || alias == false){
        let schemaURL = await publishSchema(client, {content: schema})
        let definition = await createDefinition(client, {
          name: aliasName,
          description: description,
          schema: schemaURL.commitId.toUrl()
        })
     //   let didContract = await this.useDidContractFullAccessKey()
        await contract.storeAlias({alias: accountId+':'+aliasName, definition: definition.id.toString(), description: description})
        return definition.id.toString()
      }
    } catch (err) {
      console.log('problem retrieving alias', err)
      return false
    }
  }


  // application IDX - maintains most up to date schemas and definitions ensuring chain always has the most recent commit
  async getAppIdx(contract, account, near){
  
    const appClient = await this.getAppCeramic(account.accountId)

    const legacyAppClient = await this.getLegacyAppCeramic(account.accountId)

    const appDid = this.associateAppDID(APP_OWNER_ACCOUNT, contract, appClient)
  
    // Retrieve cached aliases
    let rootAliases = get(ALIASES, [])
    if(rootAliases.length > 0){
        const appIdx = new IDX({ ceramic: appClient, aliases: rootAliases[0]})
        return appIdx
    } else {

    // uncomment below to change a definition
    // let changed = await this.changeDefinition(APP_OWNER_ACCOUNT, 'opportunities', legacyAppClient, opportunitiesSchema, 'opportunities to complete', contract)
    // console.log('changed schema', changed)

      const definitions = this.getAlias(APP_OWNER_ACCOUNT, 'Definitions', appClient, definitionsSchema, 'alias definitions', contract)
      const schemas = this.getAlias(APP_OWNER_ACCOUNT, 'Schemas', appClient, schemaSchema, 'user schemas', contract)
      const profile = this.getAlias(APP_OWNER_ACCOUNT, 'profile', appClient, profileSchema, 'persona profiles', contract)
      const accountsKeys = this.getAlias(APP_OWNER_ACCOUNT, 'accountsKeys', appClient, accountKeysSchema, 'user account info', contract)
      const comments = this.getAlias(APP_OWNER_ACCOUNT, 'comments', appClient, commentsSchema, 'comments', contract)
      const notifications = this.getAlias(APP_OWNER_ACCOUNT, 'notifications', appClient, notificationSchema, 'notifications', contract)
      const done = await Promise.all([
        appDid, 
        definitions, 
        schemas, 
        profile, 
        accountsKeys, 
        comments,
        notifications
      ])
      
      let rootAliases = {
        definitions: done[1],
        schemas: done[2],
        profile: done[3],
        accountsKeys: done[4],
        comments: done[5],
        notifications: done[6],
      }

      // cache aliases
      let aliases = []
      aliases.push(rootAliases)
      set(ALIASES, aliases)

      const appIdx = new IDX({ ceramic: appClient, aliases: rootAliases})

      return appIdx
    }
  }


  async getLegacyAppIdx(contract, account){

    const legacyAppClient = await this.getLegacyAppCeramic(account.accountId)
  
    const accountsKeys = this.getAlias(APP_OWNER_ACCOUNT, 'accountsKeys', legacyAppClient, accountKeysSchema, 'user account info', contract)
    const done = await Promise.all([
      accountsKeys
    ])
    
    let rootAliases = {
      accountsKeys: done[0]
    }

    const appIdx = new IDX({ ceramic: legacyAppClient, aliases: rootAliases})
    return appIdx
  }


  // retrieve user identity
  async getUserIdx(account, appIdx, near, registryContract){
      let seed = false
      set(KEY_REDIRECT, {action: false, link: ''})

      let newAccountKeys =  await this.downloadKeysSecret(appIdx, 'accountsKeys')
     
      // add legacy dao keys
      let legacyAppIdx = await this.getLegacyAppIdx(registryContract, account)
      let oldAccountKeys =  await this.downloadKeysSecret(legacyAppIdx, 'accountsKeys')
    
      let localAccounts = get(ACCOUNT_LINKS, [])
      
      if(oldAccountKeys && oldAccountKeys.length > 0){
        let i = 0
        while (i < oldAccountKeys.length){
          if(oldAccountKeys[i].accountId == account.accountId){
            seed = Buffer.from((oldAccountKeys[i].key).slice(0,32))
          }
          i++
        }
        try{
          let oldAccountUserCeramicClient
          let did = await this.getDid(account.accountId, factoryContract, registryContract)
          if(did){
            let part = did.split(':')[1]
            if(part == '3'){
              oldAccountUserCeramicClient = await this.getCeramic(account, seed)
            } else {
              oldAccountUserCeramicClient = await this.getLegacyCeramic(account, seed)
            }
          } else {
            oldAccountUserCeramicClient = await this.getCeramic(account, seed)
          }
          let curUserIdx = new IDX({ ceramic: oldAccountUserCeramicClient, aliases: appIdx._aliases})
          return curUserIdx
        } catch (err) {
          console.log('no did from oldaccounts', err)
        }
      }

      if(newAccountKeys && newAccountKeys.length > 0){
        let i = 0
        while (i < newAccountKeys.length){
          if(newAccountKeys[i].accountId == account.accountId){
            seed = Buffer.from((newAccountKeys[i].key).slice(0,32))
          }
          i++
        }
        try{
          let did = await this.getDid(account.accountId, factoryContract, registryContract)
          let currentUserCeramicClient
          if(did){
            let part = did.split(':')[1]
            if(part == '3'){
              currentUserCeramicClient = await this.getCeramic(account, seed)
            } else {
              currentUserCeramicClient = await this.getLegacyCeramic(account, seed)
            }
          } else {
            currentUserCeramicClient = await this.getCeramic(account, seed)
          }
          let curUserIdx = new IDX({ ceramic: currentUserCeramicClient, aliases: appIdx._aliases})
          return curUserIdx
        } catch (err) {
          console.log('no did from newaccounts', err)
        }
      }

      if(localAccounts && localAccounts.length > 0){
        let i = 0
        while (i < localAccounts.length){
          if(localAccounts[i].accountId == account.accountId){
            seed = Buffer.from((localAccounts[i].key).slice(0,32))
          }
          i++
        }
        try{
          let did = await this.getDid(account.accountId, factoryContract, registryContract)
          let localAccountUserCeramicClient
          if(did){
            let part = did.split(':')[1]
            if(part == '3'){
              localAccountUserCeramicClient = await this.getCeramic(account, seed)
            } else {
              localAccountUserCeramicClient = await this.getLegacyCeramic(account, seed)
            }
          } else {
            localAccountUserCeramicClient = await this.getCeramic(account, seed)
          }
          let curUserIdx = new IDX({ ceramic: localAccountUserCeramicClient, aliases: appIdx._aliases})
          return curUserIdx
        } catch (err) {
          console.log('no did from localaccount', err)
        }
      }
     
      if(seed == false){
        set(KEY_REDIRECT, {action: true, link: '/newKey'})
        return false
      }
  }

  
  async getDid(accountId, factoryContract, registryContract) {
    let dao
    let did = false
    
    try{
      did = await registryContract.getDID({accountId: accountId})
      if(did){
        return did
      }
    } catch (err) {
      console.log('error retrieving did from legacy', err)
    }
    
    if (!did){
     try {
      dao = await factoryContract.getDaoByAccount({accountId: accountId})
      did = dao.did
      } catch (err) {
        console.log('error retrieving did', err)
      }
    }
    return did
  }
}

export const ceramic = new Ceramic()