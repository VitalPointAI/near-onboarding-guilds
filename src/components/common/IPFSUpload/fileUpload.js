import React, { useState } from 'react'
const { create } = require('ipfs-http-client')

export default function FileUpload(props) {

    const[addedFileHash, setAddedFileHash] = useState('QmZsKcVEwj9mvGfA7w7wUS1f2fLqcfzqdCnEGtdq6MBR7P')
    
    const {
        handleFileHash,
        handleAvatarLoaded,
        register
    } = props

    const ipfsApi = create('https://ceramic-node.vitalpointai.com:5001')
  
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
        ipfsId = response.path
      
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

