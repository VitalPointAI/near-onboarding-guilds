import React, {useState, useEffect, useContext} from 'react'
import { appStore, onAppMount } from '../../../state/app'
import LeftSideDrawer from '../LeftSideDrawer/leftSideDrawer'
import LoginButton from '../LogInButton/loginButton'
import AccountInfo from '../AccountInfo/accountInfo'
import ImageLoader from '../ImageLoader/imageLoader'
//import NotificationCard from '../Notifications/notifications'
import {ceramic} from '../../../utils/ceramic'

// Material UI
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'

import '../../../global.css'

const nearLogo = require('../../../img/my-near-journey.png')

const logoStyle = {
    maxWidth: '150px'
}

const Header = ({ state, handleUpdate }) => {
    const [newNotifications, setNewNotifications] = useState(0)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);
    const { update } = useContext(appStore);

    const {
        wallet,
        appIdx,
        isUpdated,
        accountId
    } = state

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


    console.log('wallet', wallet)
    
    return (
        <div>
        <Grid container justifyContent="space-between" alignItems="center" spacing={1} style={{paddingRight: '5px', paddingBottom: '5px', paddingLeft: '5px', paddingTop: '5px', backgroundColor: 'black'}}>
            
            {wallet && wallet.signedIn ? 
                (
                    <>
                    <Grid item style={{marginLeft: '25px'}}>
                        <LeftSideDrawer
                        state={state}                        
                        /> 
                        <ImageLoader image={nearLogo} style={logoStyle}/>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}} >
                        {wallet && !wallet.signedIn ? <LoginButton /> :   <AccountInfo /> }
                    </Grid>
                    </>
                ) 
            :  
            wallet && !wallet.signedIn ? 
                !matches ? (
                    <>
                    <Grid item style={{marginLeft: '25px'}}>
                    <ImageLoader image={nearLogo} style={logoStyle}/>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}}>
                        {wallet && !wallet.signedIn ? <LoginButton /> :  <AccountInfo /> }
                    </Grid>
                    </>
                ) : (
                    <>
                    <Grid item style={{marginLeft: '25px'}}>
                        <LeftSideDrawer
                            state={state}
                        
                        /> 
                        <ImageLoader image={nearLogo} style={logoStyle}/>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}}>
                        {wallet && !wallet.signedIn ? <LoginButton /> :   <AccountInfo /> }
                    </Grid>
                    </>
                ) 
            : null
        }
            
        </Grid>
        </div>
    )
}

export default Header