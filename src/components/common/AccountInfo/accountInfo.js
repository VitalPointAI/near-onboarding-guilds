import React, { useState, useEffect, useContext } from 'react'
import { appStore } from '../../../state/app'
import { Link } from 'react-router-dom'
import EditProfileForm from '../../EditProfile/editProfile'
import EditGuildProfileForm from '../../EditProfile/editGuild'

// Material UI Components
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import useMediaQuery from '@mui/material/useMediaQuery'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Popover'
import MenuItem  from '@mui/material/MenuItem'
import LogoutButton from '../LogoutButton/logoutButton'
const imageName = require('../../../img/default-profile.png') // default no-image avatar
const logoName = require('../../../img/default_logo.png')

export default function PersonaInfo(props) {

    const { state, dispatch, update } = useContext(appStore)

    const {
      appIdx,
      accountId,
      curUserIdx,
      isUpdated,
      accountType,
      did
    } = state

    const {
        balance
    } = props

    const [editProfileClicked, setEditProfileClicked] = useState(false)
    const [editGuildProfileClicked, setEditGuildProfileClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [finished, setFinished] = useState(false)
    const [avatar, setAvatar] = useState(imageName)
    const [logo, setLogo] = useState(logoName)
    
    const open = Boolean(anchorEl);
    const matches = useMediaQuery('(max-width:500px)')
   
    useEffect(
        () => {
  
        async function fetchData() {
            if(isUpdated){}
            setFinished(false)
            if(did && accountType == 'individual') {
                let result = await appIdx.get('profile', did)
                if(result){
                    result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                } 
            }
            
            if(did && accountType == 'guild') {
                let result = await appIdx.get('guildProfile', did)
                if(result){
                    result.logo ? setLogo(result.logo) : setLogo(logoName)
                }
            }

            return true
        }

        fetchData()
            .then((res) => {
             res ? setFinished(true) : setFinished(false)
            })
        
    }, [isUpdated, did, accountType]
    )

    const handleEditProfileClick = (event) => {
        setAnchorEl(event.currentTarget)  
    }

    const handleEditGuildProfileClick = (event) => {
        setAnchorEl(event.currentTarget)  
    }

    function handleClose() {
        setAnchorEl(null)
    }

    return (
            <>
            {(
                finished ? (
                    <>
                    {accountType == 'individual' ?
                        <IconButton 
                        onClick={handleEditProfileClick}> <Avatar src={avatar} /></IconButton>   
                        : accountType == 'guild' ?
                        <div 
                            onClick={handleEditGuildProfileClick}
                            style={{width: '100%', 
                            height: '30px',
                            backgroundImage: `url(${logo})`,
                            backgroundColor: '#FFFFFF',
                            backgroundSize: 'contain',
                            backgroundPosition: 'center', 
                            backgroundRepeat: 'no-repeat',
                            backgroundOrigin: 'content-box'
                        }}></div> : <IconButton 
                        onClick={handleEditProfileClick}> <Avatar src={avatar} /></IconButton>  
                    }
                        <Menu open={open}
                        id="profile-menu"
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                        transformOrigin={{ vertical: "top", horizontal: "center" }}
                        >
                            <MenuItem onClick={handleClose}><LogoutButton /></MenuItem>
                        </Menu>
                    </>
                ) : <LinearProgress />
            ) 
           }

            {editProfileClicked ? <EditProfileForm
                state={state}
                handleEditProfileClickState={handleEditProfileClickState}
                curUserIdx={curUserIdx}
                did={did}
                accountId={accountId}
                /> : null }
            {editGuildProfileClicked ? <EditGuildProfileForm
                state={state}
                handleEditGuildClickState={handleEditGuildClickState}
                curUserIdx={curUserIdx}
                did={did}
                accountId={accountId}
                /> : null }
       </>
    )
}