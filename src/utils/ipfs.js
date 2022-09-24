const ipfsClient = require('ipfs-http-client')
import { IPFS_CALL, TOKEN_CALL } from '../../../utils/ceramic'

const axios = require('axios').default

const projectId = '2FBYSWc0L9flpacZNeRChxEPcJH'

class IpfsConnection {

    async createIPFS() {
        let token = await axios.post(TOKEN_CALL, 
            {
            accountId: accountId
            }    
        )
        
        let authToken = token.data.token
        
        let retrieveKey = await axios.post(IPFS_CALL, {
            // ...data
        },{
            headers: {
            'Authorization': `Basic ${authToken}`
            }
        })
        console.log('projectid', projectId)
        console.log('retrievekey', retrieveKey)
        const auth =
        'Basic ' + Buffer.from(projectId + ':' + retrieveKey.data.seed).toString('base64');

        const client = ipfsClient.create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https',
            headers: {
                authorization: auth,
            },
        });
        return client
    }
}

export const ipfsConnection = new IpfsConnection()