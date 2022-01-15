import * as nearApiJs from 'near-api-js'
import { config } from '../state/config'

const {
    factoryContractName
} = config

class Factory {

    constructor(){}

    async initFactoryContract(account) {
      
        const factorycontract = new nearApiJs.Contract(account, factoryContractName, {
            viewMethods: [
                'getDaoList',
                'getDaoListLength',
                'getDaoIndex',
                'getDaoByAccount'
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
               'createDAO',
               'inactivateDAO'
            ]
            });
            return factorycontract
    }
    
}

export const factory = new Factory()