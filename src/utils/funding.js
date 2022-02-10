import * as nearApiJs from 'near-api-js'
import { config } from '../state/config'

const {
    fundingContractName
} = config

class Funding {

    constructor(){}

    async initFundingContract(account) {
      
        const fundingcontract = new nearApiJs.Contract(account, fundingContractName, {
            viewMethods: [
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
               'init',
               'setContractToFund',
               'transferAdmin'
            ]
            });
            return fundingcontract
    }
    
}

export const funding = new Funding()