import React, { useState, useEffect, useContext } from 'react'
import { appStore } from '../../../state/app'
import { Link } from 'react-router-dom'
import EditProfileForm from '../../EditProfile/editProfile'

// Material UI Components
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'

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

    const handleEditProfileClick = () => {
        handleExpanded()
        handleEditProfileClickState(true)
    }

    function handleEditProfileClickState(property){
        setEditProfileClicked(property)
    }

    function handleExpanded() {
        setAnchorEl(null)
    }

    return (
            <>
                {!matches ? (
                    <>  
                    <Button style={{textAlign: 'center', marginRight: '30px'}}>Purpose</Button>
                    <Link to={`/`} variant="body1">
                        <Button style={{textAlign: 'center', marginRight: '30px'}}>Opportunities</Button>
                    </Link>
                    <Link to={`/`} variant="body1">
                        <Button style={{textAlign: 'center'}}>Supporters</Button>
                    </Link>
                            
                    </>
                    ) : (
                    <>               
                    <Button style={{textAlign: 'center', marginRight: '10px'}}>Purpose</Button>
                    <Link to={`/`} variant="body1">
                        <Button style={{textAlign: 'center', marginRight: '10px'}}>Opportunities</Button>
                    </Link>
                    <Link to={`/`} variant="body1">
                        <Button style={{textAlign: 'center'}}>Supporters</Button>
                    </Link>
                       
                    </>
                    )
                     }
          
            {!matches ? (
                finished ? (
                    <>
                    <Typography variant="overline" display="block" style={{display: 'inline-flex', float: 'right'}} onClick={handleEditProfileClick}>
                        <Avatar src={avatar} style={{marginRight: '5px'}} onClick={handleEditProfileClick}/>
                        {accountId}: {balance} Ⓝ
                    </Typography>                    
                    </>
                ) : <LinearProgress />
            ) : (
                finished ? (
                    <>
                    <Typography variant="overline" display="block" style={{display: 'inline-flex'}} onClick={handleEditProfileClick}>
                        <Avatar src={avatar} style={{marginRight: '5px'}} onClick={handleEditProfileClick}/>
                        {accountId}: {balance} Ⓝ
                    </Typography> 
                    </>
                ) : <LinearProgress />
           )}

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