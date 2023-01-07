import React, { useState, useEffect, useContext } from 'react'
import * as nearAPI from 'near-api-js'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../../state/app'
import { ceramic } from '../../../utils/ceramic'
import Intro from '../Intro/intro'
import Social from '../../common/Social/social'
import { signal } from '../../../state/user'


// Material UI Components

import Button from '@mui/material/Button'
import { LinearProgress } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import NotInterestedIcon from '@mui/icons-material/NotInterested'
import { Grid } from '@mui/material'
import { Typography } from '@mui/material'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import { Stack } from '@mui/material'
import { Badge } from '@mui/material'

const imageName = require('../../../img/default-profile.png') // default no-image avatar
const sortDown = require('../../../img/sortdown.png')
const sortUp = require('../../../img/sortup.png')

export default function IndivCard(props) {

  const { state, dispatch, update } = useContext(appStore);

    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [intro, setIntro] = useState('')
    const [country, setCountry] = useState('')
    const [profileNft, setProfileNft] = useState('')

    const [verified, setVerified] = useState(false)
    const [registered, setRegistered] = useState(false)

    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])

    const [introClicked, setIntroClicked] = useState(false)
    const [curUserIdx, setCurUserIdx] = useState()
    const [display, setDisplay] = useState(true)

    const [anchorEl, setAnchorEl] = useState(null)
    const [finished, setFinished] = useState(false)
    const [detailsClicked, setDetailsClicked] = useState(false) 
   
    const [memberIcon, setMemberIcon] = useState(<NotInterestedIcon />)


    const { 
      personId,
      created,
      makeSearchIndividuals,
      did
   } = props
 
   const {
     accountId, 
     appIdx,
     isUpdated,
     near,
     registryContract,
     factoryContract,
     admin,
   } = state

    useEffect(
      () => {

      async function fetchData() {
          if(isUpdated){}
          if(personId && appIdx){

            // Registration Status
            did ? setRegistered(true) : setRegistered(false)
            
            // Verification Status
            try{
              let verificationStatus = await registryContract.getVerificationStatus({accountId: personId})
                if(verificationStatus != 'null'){
                  setVerified(verificationStatus)
                }
              } catch (err) {
                console.log('error retrieving verification status', err)
              }
            
            let thisCurUserIdx
            try{
              let personAccount = new nearAPI.Account(near.connection, personId)
              thisCurUserIdx = await ceramic.getUserIdx(personAccount, appIdx, factoryContract, registryContract)
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
            makeSearchIndividuals(res)
          })
        return () => mounted = false
        }

  }, [personId, appIdx, isUpdated]
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
    await signal(sig, curUserIdx, personId, 'individual')
    update('', {isUpdated: !isUpdated})
  }
  
    return(
        <>
        {!display ? <LinearProgress /> : 
                    
          finished ? 
          (
            <>
            <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Stack direction="column" spacing={1}>
                <Badge badgeContent={currentLikes.length} anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }} color="primary" max={9999999}>  
                  <img src={sortUp} style={{width: '50px'}} onClick={(e) => handleSignal('like')}/>
                </Badge>
                <Badge badgeContent={currentDisLikes.length} anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }} color="primary" max={9999999}>  
                  <img src={sortDown} style={{width: '50px'}} onClick={(e) => handleSignal('dislike')}/>
                </Badge>
              </Stack>
            </ListItemAvatar>
            <ListItemText
              primary={<Link to={`/indiv-profiles/${did}`}>  
                <div style={{width: 'auto', 
                    height: '75px',
                    backgroundImage: `url(${profileNft ? profileNft : avatar})`, 
                    backgroundSize: 'contain',
                    backgroundPosition: 'center', 
                    backgroundRepeat: 'no-repeat',
                    backgroundOrigin: 'content-box'
                }}>
                </div>
                </Link>}
              secondary={
                <Grid container spacing={1} justifyContent="space-between" alignItems="center">
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                  <Typography variant="h5">{name != '' ? name : personId.split('.')[0]}</Typography>
                  </Grid>  
                </Grid>
              }
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
            ) 
          : null
        }
      
        {introClicked ? <Intro
          handleIntroClickState={handleIntroClickState}
          personId={personId}
          /> : null }
        </>
       
    )
}