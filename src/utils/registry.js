import * as nearApiJs from 'near-api-js'
import { config } from '../state/config'

const {
    registryContractName
} = config

class Registry {

    constructor(){}

    async initiateRegistryContract(account) {    
        // initiate the contract so its associated with this current account and exposing all the methods
        let registryContract = new nearApiJs.Contract(account, registryContractName, {
          viewMethods: [
              'getDID',
              'hasDID',
              'getAdmins',
              'getSuperAdmin',
              'retrieveAlias',
              'getType',
              'hasAlias',
              'getVerificationStatus',
              'getTier'
          ],
          // Change methods can modify the state. But you don't receive the returned value when called.
          changeMethods: [
              'init',
              'addAdmin',
              'removeAdmin',
              'changeVerificationStatus',
              'adjustKeyAllowance',
              'addVerifier',
              'removeVerifier',
              'addRole',
              'removeRole',
              'storeAlias',
              'deleteAlias',
              'putDID',
              'deleteDID',
              'changeTier'
          ],
      })
        return registryContract
    }
    
}

export const registry = new Registry()