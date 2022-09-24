import React, { useEffect, useState } from 'react'
const ipfsClient = require('ipfs-http-client')
import { IPFS_CALL, TOKEN_CALL } from '../../../utils/ceramic'

const axios = require('axios').default

const projectId = '2FBYSWc0L9flpacZNeRChxEPcJH'

export default function FileUpload(props) {

    const[addedFileHash, setAddedFileHash] = useState('QmZsKcVEwj9mvGfA7w7wUS1f2fLqcfzqdCnEGtdq6MBR7P')
    const[ipfsApi, setIpfsApi] = useState()

    const {
        handleFileHash,
        handleAvatarLoaded,
        register,
        accountId
    } = props

    useEffect(() => {
        async function fetchIPFS(){
            let ipfs = await createIPFS()
            setIpfsApi(ipfs) 
        }
        fetchIPFS()
        .then((res) => {

        })
    }, [])

   
    async function createIPFS() {
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
  
    const captureFile = (event) => {
        event.stopPropagation()
        event.preventDefault()
        handleAvatarLoaded(false)
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.onloadend = () => saveToIpfs(reader)
        reader.readAsArrayBuffer(file)
    }

    const saveToIpfs = (reader) => {
        let ipfsId
        const buffer = Buffer.from(reader.result)
      
        ipfsApi.add(buffer)
        .then((response) => {
        ipfsId = (response.path).toString('base32')
        setAddedFileHash(ipfsId)
        handleFileHash(ipfsId)
        }).catch((err) => {
        console.error(err)
        })
    }

    const arrayBufferToString = (arrayBuffer) => {
        return String.fromCharCode.apply(null, new Uint16Array(arrayBuffer))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
    }


    return (
        <div>
        
        <form id="captureMedia" onSubmit={handleSubmit} style={{textAlign: 'center', marginTop: '10px'}}>
            <input type="file" name="file" onChange={captureFile} />
        </form>
        
      </div>
    )
  }

