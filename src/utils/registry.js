import * as nearApiJs from 'near-api-js'
import { config } from '../state/config'

const {
    didRegistryContractName
} = config

class Registry {

    constructor(){}

    async initiateDidRegistryContract(account) {    
        // initiate the contract so its associated with this current account and exposing all the methods
        let didRegistryContract = new nearApiJs.Contract(account, didRegistryContractName, {
          viewMethods: [
              'getDID',
              'hasDID',
              'getAdmin',
              'retrieveAlias',
              'hasAlias',
              'getVerificationStatus'
          ],
          // Change methods can modify the state. But you don't receive the returned value when called.
          changeMethods: [
              'init',
              'transferAdmin',
              'changeVerificationStatus',
              'addVerifier',
              'removeVerifier',
              'putDID',
              'deleteDID',
              'storeAlias',
              'deleteAlias'
          ],
      })
        return didRegistryContract
    }
    
}

export const registry = new Registry()