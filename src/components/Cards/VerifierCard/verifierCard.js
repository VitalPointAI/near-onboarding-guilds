import React, { useState, useEffect, useContext } from 'react'
import * as nearAPI from 'near-api-js'
import { Link } from 'react-router-dom'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { appStore, onAppMount } from '../../../state/app'
import { ceramic } from '../../../utils/ceramic'
import Intro from '../Intro/intro'
import Social from '../../common/Social/social'
import { signal } from '../../../state/near'


// Material UI Components

import Button from '@mui/material/Button'
import { LinearProgress } from '@mui/material'
import { Grid } from '@mui/material'
import { Typography, TextField } from '@mui/material'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import { Stack } from '@mui/material'
import Chip from '@mui/material/Chip'
import StarsIcon from '@mui/icons-material/Stars'


const imageName = require('../../../img/default-profile.png') // default no-image avatar

export default function VerifierCard(props) {

  const { state, dispatch, update } = useContext(appStore);

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [intro, setIntro] = useState('')
    const [country, setCountry] = useState('')
    const [profileNft, setProfileNft] = useState('')
    const [did, setDid] = useState('')

    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])

    const [verified, setVerified] = useState(false)
    const [registered, setRegistered] = useState(false)

    const [introClicked, setIntroClicked] = useState(false)
    const [curUserIdx, setCurUserIdx] = useState()
    const [display, setDisplay] = useState(true)

    const [anchorEl, setAnchorEl] = useState(null)
    const [finished, setFinished] = useState(false)
    const [removeVerifierFinished, setRemoveVerifierFinished] = useState(true)

    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()


    const { 
      personId
   } = props
 
   const {
     appIdx,
     isUpdated,
     near,
     accountId,
     didRegistryContract,
     factoryContract,
     superAdmin,
     admins
   } = state

    useEffect(
      () => {

      async function fetchData() {
          if(isUpdated){}
          if(personId.accountId && appIdx && near){
            let did = await ceramic.getDid(personId.accountId, factoryContract, didRegistryContract)
            setDid(did)
            // Registration Status
            did ? setRegistered(true) : setRegistered(false)
            
            // Verification Status
            try{
              let verificationStatus = await didRegistryContract.getVerificationStatus({accountId: personId.accountId})
                if(verificationStatus != 'null'){
                  setVerified(verificationStatus)
                }
              } catch (err) {
                console.log('error retrieving verification status', err)
              }
            
            let thisCurUserIdx
            try{
              let personAccount = new nearAPI.Account(near.connection, personId.accountId)
              thisCurUserIdx = await ceramic.getUserIdx(personAccount, appIdx, factoryContract, didRegistryContract)
              setCurUserIdx(thisCurUserIdx)
              } catch (err) {
                console.log('problem getting curuseridx', err)
                return false
              }

            let result = await appIdx.get('profile', did)
       
            if(result){
                  result.name != '' ? setName(result.name) : setName('')
                  result.date ? setDate(result.date) : setDate('')
                  result.avatar !='' ? setAvatar(result.avatar) : setAvatar(imageName)
                  result.intro != '' ? setIntro(result.intro) : setIntro('')
                  result.country != '' ? setCountry(result.country) : setCountry('')
                  result.profileNft != '' ? setProfileNft(result.profileNft) : setProfileNft('')
                  result.likes ? setCurrentLikes(result.likes) : setCurrentLikes([])
                  result.dislikes ? setCurrentDisLikes(result.dislikes) : setCurrentDisLikes([])
                  result.neutrals ? setCurrentNeutrals(result.neutrals) : setCurrentNeutrals([])
           } else {
             setName('')
             setDate('')
             setAvatar(imageName)
             setIntro('')
             setCountry('')
             setProfileNft('')
           }
  
         }
        return true
      }

      let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
            setFinished(true)
          })
        return () => mounted = false
        }

  }, [personId, appIdx, near, isUpdated]
  )


  const handleIntroClick = () => {
    handleExpanded()
    handleIntroClickState(true)
  }

  function handleIntroClickState(property){
    setIntroClicked(property)
  }

  function handleExpanded() {
    setAnchorEl(null)
  }

  async function handleSignal(sig){
    await signal(sig, curUserIdx, personId.accountId, 'individual')
    update('', {isUpdated: !isUpdated})
  }
  
  function formatDate(timestamp) {
    let stringDate = timestamp.toString()
    let options = {year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
  }

  async function removeVerifier() {
    event.preventDefault()
    setRemoveVerifierFinished(false)
    try {
        await didRegistryContract.removeVerifier({
          accountId: personId.accountId
        })
      } catch (err) {
        console.log('error removing verifier', err)
      }
  }

    return(
        <>
        {!display ? <LinearProgress /> : 
                    
          finished ? 
          (
            <>
            <ListItem alignItems="flex-start">
            <ListItemAvatar>
            <Link to={`/indiv-profiles/${did}`}>  
            <div style={{width: 'auto', 
                height: '40px',
                backgroundImage: `url(${profileNft ? profileNft : avatar})`, 
                backgroundSize: 'contain',
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            </div>
            </Link><br></br>
            {admins && admins.includes(accountId) && accountId != personId.accountId ? <Button variant="outlined" onClick={removeVerifier}>Remove</Button> : null }
            </ListItemAvatar>
            <ListItemText
              primary={ <Grid container spacing={1} justifyContent="space-between" alignItems="center">
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
              <Typography variant="h5">{name != '' ? name : personId.accountId ? personId.accountId.split('.')[0] : 'nil'}</Typography>
              </Grid>  
              </Grid>}
              secondary={ <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              {personId && personId.accountId == superAdmin ? <Chip icon={<StarsIcon />} label="Super Admin" /> : null }
              {admins.includes(personId.accountId) ? 
                personId.accountId != superAdmin ? 
                  <Chip icon={<StarsIcon />} label="Admin" variant="outlined" />
                  : null
              : null
              }
            </Stack>}
            />
            </ListItem>
            <Grid container spacing={1} justifyContent="space-between" alignItems="center" style={{paddingLeft: '10px', paddingRight:'10px'}}>
              <Grid item xs={3} sm={3} md={3} lg={3} xl={3} >
                {intro ? (<Button variant="outlined" style={{textAlign: 'center', fontSize: '80%', marginTop:'5px'}} onClick={handleIntroClick}>Intro</Button>) : null}
              </Grid>
              <Grid item xs={9} sm={9} md={9} lg={9} xl={9} >
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Social did={did} type={'individual'} appIdx={appIdx} />
              </Grid>
            </Grid>

            <Divider variant="middle" style={{marginTop: '15px', marginBottom: '15px'}}/>
            </>
          ) : null
        }
      
        {introClicked ? <Intro
          handleIntroClickState={handleIntroClickState}
          personId={personId.accountId}
          /> : null }
        </>
       
    )
}