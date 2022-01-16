import React, { useState, useEffect, useContext } from 'react'
import { appStore } from '../../../state/app'
import { Link } from 'react-router-dom'
import EditProfileForm from '../../EditProfile/editProfile'

// Material UI Components
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import useMediaQuery from '@mui/material/useMediaQuery'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Popover'
import MenuItem  from '@mui/material/MenuItem'
import LogoutButton from '../LogoutButton/logoutButton'
const imageName = require('../../../img/default-profile.png') // default no-image avatar

export default function PersonaInfo(props) {

    const { state, dispatch, update } = useContext(appStore)

    const {
      appIdx,
      accountId,
      curUserIdx,
      isUpdated,
      did
    } = state

    const {
        balance
    } = props

    const [editProfileClicked, setEditProfileClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [finished, setFinished] = useState(false)
    const [avatar, setAvatar] = useState(props.avatar)
    
    const open = Boolean(anchorEl);
    const matches = useMediaQuery('(max-width:500px)')
   
    useEffect(
        () => {
  
        async function fetchData() {
            if(isUpdated){}
            setFinished(false)
            if(did) {
                let result = await appIdx.get('profile', did)
                if(result){
                    result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                }
            }
            return true
        }

        fetchData()
            .then((res) => {
             res ? setFinished(true) : setFinished(false)
            })
        
    }, [isUpdated, did]
    )

    const handleEditProfileClick = (event) => {
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
                 
                        <IconButton 
                        onClick={handleEditProfileClick}> <Avatar src={avatar} /></IconButton>   

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
       </>
    )
}