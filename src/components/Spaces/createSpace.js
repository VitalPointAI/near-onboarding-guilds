import React, { useState, useEffect, useContext } from 'react'

import * as nearAPI from 'near-api-js'
import { appStore, onAppMount } from '../../state/app'
import { useForm, useFieldArray } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { ceramic } from '../../utils/ceramic'
import { nft } from '../../utils/nft'
import { 
    spaceMint,
    generateId,
    KeyPair,
    SPACE_CREATED,
    IPFS_PROVIDER } from '../../state/near'
import FileUpload from '../IPFSupload/ipfsUpload'
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js'
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { get, set, del } from '../../utils/storage'

// Material UI components
import { makeStyles } from '@mui/material/styles'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Grid from '@mui/material/Grid'
import Tooltip from '@mui/material/Tooltip'
import Zoom from '@mui/material/Zoom'
import InfoIcon from '@mui/material-icons/Info'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 50
  },
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  }));

const imageName = require('../../img/default-profile.png') // default no-image avatar
const defaultToken = require('../../img/default-coin.png') // default no-token image

export default function AddSpace(props) {
    const [done, setDone] = useState(props.done)

    // NEAR on chain data (also replicated in Ceramic)
        const [spaceId, setSpaceId] = useState('')

        // refers to decentralized identifier (did) on Ceramic
        const [spaceReference, setSpaceReference] = useState()
        const [spaceReferenceHash, setSpaceReferenceHash] = useState()

    // Ceramic metadata (editable)
        const [spaceType, setSpaceType] = useState('')
        const [spaceTitle, setSpaceTitle] = useState('')
        const [spaceDescription, setSpaceDescription] = useState(EditorState.createEmpty())
        
        const [spaceImages, setSpaceImages] = useState([])
        const [attachedImageFiles, setAttachedImageFiles] = useState([])
        const [addedImageFileHash, setAddedImageFileHash] = useState('QmZsKcVEwj9mvGfA7w7wUS1f2fLqcfzqdCnEGtdq6MBR7P')
        
        const [spaceMedia, setSpaceMedia] = useState([])
        const [attachedMediaFiles, setAttachedMediaFiles] = useState([])
        const [addedMediaFileHash, setAddedMediaFileHash] = useState('QmZsKcVEwj9mvGfA7w7wUS1f2fLqcfzqdCnEGtdq6MBR7P')
    
        const [spaceCopies, setSpaceCopies] = useState(0)
        const [spaceCreated, setSpaceCreated] = useState()
        const [spaceExpires, setSpaceExpires] = useState()
        const [spaceStarts, setSpaceStarts] = useState()
        const [spaceUpdated, setSpaceUpdated] = useState()

        const [curNFTIdx, setCurNFTIdx] = useState()

    const [confirm, setConfirm] = useState(false)
    const [clicked, setClicked] = useState(false)
    const [creator, setCreator] = useState()
    const [essentials, setEssentials] = useState(false)
    const [currentFTAccount, setCurrentFTAccount] = useState()
    
    const [FTContract, setFTContract] = useState()
    const [tokenIconUrl, setTokenIconUrl] = useState()

    const [finished, setFinished] = useState(false)

    const ipfsApi = create('https://infura-ipfs.io:5001')

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore);

    const {
      accountId,
      currentTokensList,
      didRegistryContract,
      nftContract,
      near,
      appIdx
    } = state

    const {
      contractId
    } = useParams()

    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()
    
    const {
      fields: imageFields,
      append: imageFieldsAppend,
      remove: imageFieldsRemove} = useFieldArray({
     name: "images",
     control
    })

    const {
        fields: mediaFields,
        append: mediaFieldsAppend,
        remove: mediaFieldsRemove} = useFieldArray({
       name: "media",
       control
    })

    const images = watch('images', imageFields)
    let controlledImageFields = imageFields.map((image, index) => {
      return {
        ...image,
        ...image[index]
      }
    })

    const media = watch('media', mediaFields)
    let controlledMediaFields = mediaFields.map((image, index) => {
      return {
        ...media,
        ...media[index]
      }
    })
   
    useEffect(
      () => {
        let i = 0
        if(currentTokensList){
          while(i < currentTokensList.length){
            if(currentTokensList[i].contractId == contractId){
              let owner = currentTokensList[i].creator
              setCreator(owner)
              break
            }
            i++
          }
        }
      }, [currentTokensList])

    useEffect(
    () => {
      async function essentials(){
        if(near && curUserIdx){

            
            
            
            let account
          try{
            account = new nearAPI.Account(near.connection, nftFactoryContractName)
            setCurrentNFTAccount(account)
          } catch (err) {
            console.log('no account', err)
            return false
          }
          
          let curNFTIdx
          try{
            curNFTIdx = await ceramic.getUserIdx(account, appIdx, didRegistryContract)
            setCurNFTIdx(curNFTIdx)
            console.log('curNFTIdx', curNFTIdx)
          } catch (err) {
            console.log('problem getting curNFTIdx', err)
            return false
          }

          let ftContract
          try{
            ftContract = await ft.initFTContract(ftAccount, contractId)
            setFTContract(ftContract)
          } catch (err) {
            console.log('problem getting ftcontract', err)
            return false
          }
        }
        return true
      } 

      essentials()
        .then((res) => {
          res ? setEssentials(true) : setEssentials(false)
        })
    }, [near]
    )

    useEffect(
      () => {
        async function processTriggers(){
          if(curNFTIdx){
            console.log('trigger curNFTIdx', curNFTIdx)
            let urlVariables = window.location.search
            const urlParameters = new URLSearchParams(urlVariables)
            let transactionHash = urlParameters.get('transactionHashes')
            let errorCode = urlParameters.get('errorCode')
            console.log('errorCode', errorCode)

            // check for first init to log token summon events
            let didCreateSpace = get(SPACE_CREATED, [])
        
            let cc = 0
            while(cc < didCreateSpace.length){
              if(didCreateSpace[cc].tokenId==tokenId && didCreateSpace[cc].init == true){
              
                let logged = await logFTInitEvent(
                  contractId, 
                  curNFTIdx, 
                  FTContract, 
                  state.accountId,
                  didCreateSpace[cc].metadata,
                  didCreateSpace[cc].maxSupply,
                  didCreateSpace[cc].creationTime,
                  transactionHash)
                console.log('logged', logged)
                if (logged) {
                  del(FT_FIRST_INIT)
                  window.location.assign('/fts')
                }
              }
              cc++
            }
          }
        }

        if(essentials){
        processTriggers()
          .then((res) => {

          })
        }

      }, [essentials, curNFTIdx]
    )

      function handleTokenFileHash(hash) {
        setTokenIcon(IPFS_PROVIDER + hash)
      }

      function setCreateTrigger(tokenId, metadata) {
        // set trigger for created space to update metadata on success
        let created = get(SPACE_CREATED, [])
        created.push({tokenId: tokenId, metadata: metadata, init: true })
        set(SPACE_CREATED, created)
      }

      async function prepForMetadata(){
        const keyPair = KeyPair.fromRandom('ed25519')
        let publicKey = keyPair.getPublicKey().toString().split(':')[1]
        
        let newNFTIdx = await ceramic.getSpaceIDX(keyPair.secretKey, nftContract)
        setCurNFTIdx(newNFTIdx)
        
        let nftKeys = await ceramic.downloadKeysSecret(curUserIdx, 'accountsKeys')
        let tokenId = generateId()
        setSpaceId(tokenId)

        nftKeys.push({
            tokenId: tokenId, 
            key: keyPair.secretKey, 
            publicKey: publicKey,
            owner: accountId, 
            keyStored: Date.now() 
        })

        await ceramic.storeKeysSecret(curUserIdx, nftKeys, 'accountsKeys')
      }
      

      const handleSpaceTitleChange = (event) => {
        setSpaceTitle(event.target.value)
        setMetaData({...metadata, 'title': event.target.value})
      }

      const handleSpaceDescriptionChange = (editorState) => {
          setSpaceDescription(editorState)
      }

      const handleToken = (event) => {
        const reader = new FileReader()
        reader.readAsDataURL(event.target.files[0])
        reader.addEventListener("load", function () {
          // convert image file to base64 string
          setTokenIconUrl(reader.result);
        }, false);
        // reader.readAsDataURL(event.target.files[0])
        // console.log('reader', reader)
        // console.log('readerresult', reader.result)
        // setTokenIconUrl(reader.result)
      }
  
      const handleTokenSymbolChange = (event) => {
        let v = event.target.value
        let formattedV = v.toUpperCase()
        setTokenSymbol(formattedV)
      }
  
      const handleTokenDecimalsChange = (event) => {
          setTokenDecimals(event.target.value)
      }
  
      const handleMaxSupplyChange = (event) => {
          setMaxSupply(event.target.value)
      }

      // Attached Image File Handlers

      function handleImageFileHash(hash, name) {
        let fullHash = IPFS_PROVIDER + hash
        let newAttachedImageFiles = { name: name, hash: fullHash }
        attachedImageFiles.push(newAttachedImageFiles)
        setSpaceImages(attachedImageFiles)
      }
    
      const captureImageFile = (i) => {
        console.log('here', i)
          event.stopPropagation()
          event.preventDefault()
          //const file = event.target.files[0]
          const file = controlledImageFields[i].hash[0]
          let name = controlledImageFields[i].hash[0].name
          let reader = new window.FileReader()
          reader.onloadend = () => saveImageToIpfs(reader, name)
          reader.readAsArrayBuffer(file)
      }
  
      const saveImageToIpfs = (reader, name) => {
          let ipfsId
          const buffer = Buffer.from(reader.result)
          ipfsApi.add(buffer)
          .then((response) => {
          ipfsId = response.path
          console.log('ipfsId', ipfsId)
          setAddedImageFileHash(ipfsId)
          handleImageFileHash(ipfsId, name)
          }).catch((err) => {
          console.error(err)
          })
      }

      // Attached Media File Handlers
      
      function handleMediaFileHash(hash, name) {
        let fullHash = IPFS_PROVIDER + hash
        let newAttachedMediaFiles = { name: name, hash: fullHash }
        attachedMediaFiles.push(newAttachedMediaFiles)
        setSpaceMedia(attachedMediaFiles)
      }
    
      const captureMediaFile = (i) => {
        console.log('here', i)
          event.stopPropagation()
          event.preventDefault()
          //const file = event.target.files[0]
          const file = controlledMediaFields[i].hash[0]
          let name = controlledMediaFields[i].hash[0].name
          let reader = new window.FileReader()
          reader.onloadend = () => saveMediaToIpfs(reader, name)
          reader.readAsArrayBuffer(file)
      }
  
      const saveMediaToIpfs = (reader, name) => {
          let ipfsId
          const buffer = Buffer.from(reader.result)
          ipfsApi.add(buffer)
          .then((response) => {
          ipfsId = response.path
          console.log('ipfsId', ipfsId)
          setAddedMediaFileHash(ipfsId)
          handleMediaFileHash(ipfsId, name)
          }).catch((err) => {
          console.error(err)
          })
      }
  

      const onSubmit = async (values) => {
        try{
          await initFT(
            state.wallet, 
            contractId,
            tokenName,
            tokenSymbol,
            tokenIconUrl,
            '',
            '',
            tokenDecimals,
            maxSupply
            )
          setFinished(true)
        } catch (err) {
          console.log('error initializing token', err)
          setFinished(true)
        }
        setFinished(false)
      }
  
      return (
        <>
        {creator == accountId ? (
        <Grid container className={classes.confirmation} spacing={1}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '50px'}}>
          <Typography variant="subtitle1">Prepare your Space</Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} align="center"></Grid>
        
        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{textAlign: 'center'}}>
        <Card>
            <CardContent>
                <Typography variant="h6">Space Details</Typography>
      
                <TextField
                fullWidth
                margin="dense"
                id="spaceTitle"
                variant="outlined"
                name="spaceTitle"
                label="Space Title"
                required={true}
                value={spaceTitle}
                onChange={handleSpaceTitleChange}
                inputRef={register({
                    required: true
                })}
                placeholder="The Atrium"
                InputProps={{
                  endAdornment: <>
                  <Tooltip TransitionComponent={Zoom} title="Give your space a unique name.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />

              <Typography variant="body1">Please provide detail for your payout request including proof of work completion if applicable:</Typography>
              <Paper style={{padding: '5px'}}>
              <Editor
                name="spaceDescription"
                editorState={spaceDescription}
                toolbarClassName="toolbarClassName"
                wrapperClassName="wrapperClassName"
                editorClassName="editorClassName"
                onEditorStateChange={handleSpaceDescriptionChange}
                editorStyle={{minHeight:'200px'}}
              />
              </Paper>
              {errors.details && <p style={{color: 'red'}}>Please describe the space you have available.</p>}
              
   
              <TextField
                fullWidth
                margin="dense"
                id="tokenSymbol"
                variant="outlined"
                required={true}
                name="tokenSymbol"
                label="Token Symbol"
                placeholder="MYT"
                value={tokenSymbol}
                onChange={handleTokenSymbolChange}
                inputRef={register({
                    required: true,
                    validate: value => value.length <= 5 || <p style={{color:'red'}}>Token symbol should be no more than 5 characters long.</p>
                })}
                InputProps={{
                  endAdornment: <>
                  <Tooltip TransitionComponent={Zoom} title="The ticker symbol of your token - typically 3-5 characters long.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />
              
              <Avatar src={tokenIconUrl} style={{float: 'left', marginRight: '20px'}}/>
              <span style={{verticalAlign: 'top', display: 'inline-block'}}>
              <Button
                variant="contained"
                color="primary"
                component="label"
              >
                Upload Token Icon
                <input
                  accept="image/*"
                  type="file"
                  hidden
                  onChange={handleToken}
                />
                </Button><br></br>
                <Typography variant="caption" style={{marginTop: '5px'}}>32px x 32px (SVG recommended)</Typography>
              </span>
     
              <TextField
                fullWidth
                margin="dense"
                id="tokenDecimals"
                variant="outlined"
                required={true}
                name="tokenDecimals"
                label="Decimals"
                placeholder="24"
                value={tokenDecimals}
                onChange={handleTokenDecimalsChange}
                inputRef={register({
                    required: true, 
                })}
                InputProps={{
                  endAdornment: <>
                  <Tooltip TransitionComponent={Zoom} title="Usually set to 24 for a token on NEAR">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />

              <TextField
                fullWidth
                margin="dense"
                id="maxSupply"
                variant="outlined"
                required={true}
                name="maxSupply"
                label="Max Supply"
                placeholder="1000000000"
                value={maxSupply}
                onChange={handleMaxSupplyChange}
                inputRef={register({
                    required: true, 
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">tokens</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="Maximum supply of tokens that will be available.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />
             
              </CardContent>
              </Card>
              <br></br>
              <Button
              disabled={state.app.accountTaken || clicked}
              variant="contained"
              color="primary"
              onClick={handleSubmit(onSubmit)}>
                INITIALIZE TOKEN
              </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={4} lg={4} xl={4} align="center"></Grid>
      </Grid>
        ) : 'Fungible Token not initialized yet'}
        </>
    )
  
}