import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../../state/app'

// Material UI Components
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { LinearProgress } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'

const imageName = require('../../../img/default-profile.png') // default no-image avatar
const logoName = require('../../../img/default_logo.png') // default no-logo

export default function PersonaInfo(props) {
    const [profileExists, setProfileExists] = useState(false)
    const [editPersonaClicked, setEditPersonaClicked] = useState(false)
    const [purposeClicked, setPurposeClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [finished, setFinished] = useState(false)
    const [avatar, setAvatar] = useState(imageName)
    const [pfpAvatar, setPfpAvatar] = useState('')
    const [claimCount, setClaimedCount] = useState(0)
    const [daoCount, setDaoCount] = useState()

    const [logo, setLogo] = useState(logoName)
    const [pfpLogo, setPfpLogo] = useState('')
    const [name, setName] = useState('')

    const { state, dispatch, update } = useContext(appStore)

    const {
      near,
      appIdx,
      accountId,
      curUserIdx,
      claimed,
      currentDaosList,
      isUpdated,
      links,
      balance,
      did,
      
    } = state

    const {
        accountType
    } = state.user

    const {
        contractId
    } = useParams()

    const matches = useMediaQuery('(max-width:500px)');
   
    useEffect(
        () => {
  
        async function fetchData() {
            if(isUpdated){}
            setFinished(false)
            if(did && accountType != 'guild') {
                let result = await appIdx.get('profile', did)
                
                if(result){
                    result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                    result.name ? setName(result.name) : setName('')
                    result.profileNft ? setPfpAvatar(result.profileNft) : setPfpAvatar('')
                }
            } else {
                if(did && accountType == 'guild'){
                    let result = await appIdx.get('guildProfile', did)
                  
                    if(result){
                        result.logo ? setLogo(result.logo) : setLogo(logoName)
                        result.name ? setName(result.name) : setName('')
                        result.profileNft ? setPfpLogo(result.profileNft) : setPfpLogo('')
                    }
                }
            }
              

                // if(claimed && claimed.length > 0){
                //     let i = 0
                //     let count = 0
                //     while (i < claimed.length){
                //         if(claimed[i].owner == accountId){
                //         count++
                //         }
                //     i++
                //     }
                //     setClaimedCount(count)
                // }  
               
            if(currentDaosList && currentDaosList.length > 0){
                let count = 0
                let i = 0
                while(i < currentDaosList.length){
                    if(currentDaosList[i].summoner == accountId){
                        count++
                    }
                    i++
                }
                setDaoCount(count)
            }
 
                // if((links && links.length > 0) || (claimed && claimed.length > 0) || (currentDaosList && currentDaosList.length > 0)){
                //     return true
                // }
            return true
        }
        

        fetchData()
            .then((res) => {
             res ? setProfileExists(true) : null
             setFinished(true)
            })
        
    }, [isUpdated, did, claimed, currentDaosList]
    )

  const handleEditPersonaClick = () => {
    handleExpanded()
    handleEditPersonaClickState(true)
  }

  function handleEditPersonaClickState(property){
    setEditPersonaClicked(property)
  }

  
  const handlePurposeClick = () => {
    handleExpanded()
    handlePurposeClickState(true)
  }

  function handlePurposeClickState(property){
    setPurposeClicked(property)
  }


  function handleExpanded() {
    setAnchorEl(null)
  }

    return (
            <>
          
            {!matches ? (

                finished ? (
                    <>
                    
                            <Typography variant="overline" onClick={handleEditPersonaClick}>
                            {accountType == 'guild' ? (<>
                                <a href={`https://nearguilds.live/guild-profiles/${did}`}>
                                    <div style={{
                                        height: '100px',
                                        backgroundImage: `url(${pfpLogo != logoName && pfpLogo != '' ? pfpLogo : logo})`, 
                                        backgroundSize: 'contain',
                                        backgroundPosition: 'center', 
                                        backgroundRepeat: 'no-repeat',
                                        backgroundOrigin: 'content-box'
                                    }}/>
                                </a>
                                </>
                                )
                            :  ( <>
                                <a href={`https://nearpersonas.live/indiv-profiles/${did}`}>
                                    <Avatar src={pfpAvatar != imageName && pfpAvatar != '' ? pfpAvatar : avatar} style={{marginRight: '5px'}} onClick={handleEditPersonaClick}/>
                                </a>
                                </>)
                            }{name ? name : accountId}: {balance} Ⓝ
                            </Typography>
                                          
                    </>
                ) : <LinearProgress />
            ) : (
                finished ? (
                    <>
                    
                    <Typography variant="overline"  onClick={handleEditPersonaClick}>
                        {accountType == 'guild' ? (<>
                            <a href={`https://nearguilds.live/guild-profiles/${did}`}>
                                <div style={{
                                    height: '100px',
                                    backgroundImage: `url(${pfpLogo != logoName && pfpLogo != '' ? pfpLogo : logo})`, 
                                    backgroundSize: 'contain',
                                    backgroundPosition: 'center', 
                                    backgroundRepeat: 'no-repeat',
                                    backgroundOrigin: 'content-box'
                                }}/>
                            </a>
                            </>
                            )
                        :  ( <>
                            <a href={`https://nearpersonas.live/indiv-profiles/${did}`}>
                                <Avatar src={pfpAvatar != imageName && pfpAvatar != '' ? pfpAvatar : avatar} style={{marginRight: '5px'}} onClick={handleEditPersonaClick}/>
                            </a>
                            </>)
                        }{name ? name : accountId}: {balance} Ⓝ
                    </Typography>
                       
                    </>
                ) : <LinearProgress />
           )}

       </>
    )
}