import * as nearApiJs from 'near-api-js'
import { config } from '../state/config'

const {
    nftFactoryContractName
} = config

class NFT {

    constructor(){}

    async initNFTContract(account) {
      
        const nftContract = new nearApiJs.Contract(account, nftFactoryContractName, {
            viewMethods: [
                'nft_token',
                'nft_is_approved',
                'nft_total_supply',
                'nft_tokens',
                'nft_supply_for_owner',
                'nft_tokens_for_owner',
                'nft_metadata',
                'nft_payout'
                
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
               'nft_mint',
               'nft_transfer',
               'nft_transer_call',
               'nft_approve',
               'nft_revoke',
               'nft_revoke_all',
               'nft_transfer_payout'
            ]
            });
            return nftContract
    }
    
}

export const nft = new NFT()