import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../../state/app'
import LeftSideDrawer from '../LeftSideDrawer/leftSideDrawer'
import LoginButton from '../LogInButton/loginButton'
import LogoutButton from '../LogoutButton/logoutButton'
import AccountInfo from '../AccountInfo/accountInfo'
import ImageLoader from '../ImageLoader/imageLoader'
//import NotificationCard from '../Notifications/notifications'
import {ceramic} from '../../../utils/ceramic'

// Material UI
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import Stack from '@mui/material/Stack'
import { Typography } from '@mui/material'

import '../../../global.css'

const nearLogo = require('../../../img/near-guilds-logo.png')

const logoStyle = {
    maxWidth: '150px',
    marginTop: '10px'
}

const Header = ({ handleUpdate }) => {
    const [newNotifications, setNewNotifications] = useState(0)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);
    const { state, update } = useContext(appStore);

    const {
        userInitialized,
        curUserIdx,
        did,
        isVerifier,
        isVerified,
        isAdmin,
        accountType,
        account,
        accountId,
        signedIn,
        balance,
        wallet,
        walletContract, 
        registryContract, 
        factoryContract, 
        nftContract, 
        fundingContract,
        catalystContract
    } = state.user
    
    const {
        mounted,
        appIdx,
        near,
        appRegistryContract,
        ceramicClient,
        appAccount,
        superAdmin,
        admins,
        announcements,
        isUpdated,
        currentGuilds, 
        currentCommunities, 
        guildsAwaitingVerification,
        currentIndividuals,
        currentVerifiers
    } = state.app

    useEffect(
        () => {
        async function fetchData(){
            if(isUpdated){}
            if(accountId){
                //get the list of all notifications for all accounts
       
                let result = await ceramic.downloadKeysSecret(appIdx, 'notifications')
                if(result){

                    //convert the object from ceramic to map in order to more easily
                    //return notifications associated with current account
                    if(result[0]){
                        let notificationMap = new Map(Object.entries(result[0])) 

                        let notifications = 0;

                        //loop thorugh all notifications for user, if the read flag is false, increase the count
                        //for the notification badge
                        if(notificationMap.get(accountId)){
                            for(let i = 0; i < notificationMap.get(accountId).length; i++){
                                if(notificationMap.get(accountId)[i].read == false){
                                    notifications++;
                                }
                            }
                        }
                    

                    //set the counter for the badge to the amount of unread notifications
                    setNewNotifications(notifications)
                    }
                }
            }
        }
        fetchData()
        .then((res) => {
        
        })
    }, [accountId, isUpdated])

    const matches = useMediaQuery('(max-width:500px)')

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        update('', {isUpdated: !isUpdated})
        setPopoverOpen(true)

    }

    const handleClose = () => {
        setAnchorEl(null);
        update('', {isUpdated: !isUpdated})
        setPopoverOpen(false)
    }
    
    return (
        
        <Grid container justifyContent="space-between" alignItems="center" spacing={1} style={{paddingRight: '10px', paddingLeft: '10px', paddingBottom: '5px', backgroundColor: 'black'}}>
            
            {wallet && wallet.signedIn ? 
                !matches ? (
                    <>
                    <Grid item >
                    <div style={{float:'left', marginTop: '15px'}}>
                        <LeftSideDrawer
                        state={state}    
                        />
                    </div>
                        <Link to="/"> 
                            <ImageLoader image={nearLogo} style={logoStyle}/>
                        </Link>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}}>
        
                        {wallet && !wallet.signedIn ? <LoginButton /> :  
                            <Stack direction="row" spacing={1} justifyContent="center">
                                <Typography variant="overline" style={{color:'#FFFFFF'}}>
                                    {accountId}
                                </Typography>
                                <LogoutButton /> 
                            </Stack>
                        }
                    </Grid>
                    </>
                )
                : (
                    <>
                    <Grid item >
                        <div style={{float:'left', marginTop: '15px'}}>
                            <LeftSideDrawer
                            state={state}                        
                            />
                        </div>
                        <Link to="/"> 
                            <ImageLoader image={nearLogo} style={logoStyle}/>
                        </Link>
                    </Grid>
                    <Grid item  style={{minWidth: '100px'}}>
                        {wallet && !wallet.signedIn ? <LoginButton /> :  
                            <Stack spacing={1} justifyContent="center">
                                <Typography variant="overline" style={{color:'#FFFFFF'}}>
                                    {accountId.length <= 17 ? accountId : accountId.substring(0,15) + "..."}
                                </Typography>
                                <LogoutButton /> 
                            </Stack>
                        }
                    </Grid>
                    </>
                )
            :  
            wallet && !wallet.signedIn ? 
                !matches ? (
                    <>
                    <Grid item >
                        <div style={{float:'left', marginTop: '15px'}}>
                            <LeftSideDrawer
                                state={state}                        
                            />
                        </div>
                        <Link to="/"> 
                            <ImageLoader image={nearLogo} style={logoStyle}/>
                        </Link>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}}>
                        {wallet && !wallet.signedIn ? <LoginButton /> :   
                            <Stack direction="row" spacing={1} justifyContent="center">
                                <Typography variant="overline" style={{color:'#FFFFFF'}}>
                                    {accountId}
                                </Typography>
                                <LogoutButton /> 
                            </Stack>
                        }
                    </Grid>
                    </>
                ) : (
                    <>
                    <Grid item >
                        <div style={{float:'left', marginTop: '15px'}}>
                            <LeftSideDrawer
                                state={state}
                            
                            />
                        </div>
                        <Link to="/"> 
                            <ImageLoader image={nearLogo} style={logoStyle}/>
                        </Link>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}}>
                        {wallet && !wallet.signedIn ? <LoginButton /> :  
                            <Stack spacing={1} justifyContent="center">
                                <Typography variant="overline" style={{color:'#FFFFFF'}}>
                                    {accountId.length <= 17 ? accountId : accountId.substring(0,15) + "..."}
                                </Typography>
                                <LogoutButton /> 
                            </Stack>
                        }
                    </Grid>
                    </>
                ) 
            : null
        }
            
        </Grid>
        
      
    )
}

export default Header