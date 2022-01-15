import React, {useState, useEffect, useContext} from 'react'
import { appStore, onAppMount } from '../../../state/app'
import LeftSideDrawer from '../LeftSideDrawer/leftSideDrawer'
import LogoutButton from '../LogoutButton/logoutButton'
import LoginButton from '../LogInButton/loginButton'
import AccountInfo from '../AccountInfo/accountInfo'
import Logo from '../Logo/logo'
//import NotificationCard from '../Notifications/notifications'
import {ceramic} from '../../../utils/ceramic'

// Material UI
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import Badge from '@mui/material/Badge'
import NotificationsIcon from '@mui/icons-material/Notifications'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import '../../../global.css'

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

    function handleNotificationClick(property){
        return; 
    }

    
    return (
        <><div>
        <Grid container justifyContent="space-between" alignItems="center" spacing={0} style={{paddingRight: '5px', paddingLeft: '5px', paddingTop: '5px', backgroundColor: 'white'}}>
            
            {wallet && wallet.signedIn ? 
                !matches ? (
                    <>
                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                       
                        <LeftSideDrawer
                        state={state}                        
                        /> 
                     
                        <Logo />
                    </Grid>
                    <Grid item xs={8} sm={8} md={8} lg={8} xl={8}>
                        <AccountInfo balance={wallet.balance} /> 
                        
                    </Grid>
                    <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                        
                        <IconButton onClick={handleClick} color="primary" component="span">
                            <Badge  badgeContent={newNotifications} color='primary'>
                                <NotificationsIcon fontSize='small' style={{marginTop: '-8px'}} /> 
                            </Badge>
                        </IconButton>
                   
                        {wallet && !wallet.signedIn ? <LoginButton /> : <LogoutButton/>}
                    
                    <Popover
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                         vertical: 'bottom',
                         horizontal: 'center',
                     }}
                    style={{maxWidth: '20%', maxHeight: '80%'}} 
                    open={popoverOpen}
                    >
                        <NotificationCard
                            handleNotificationClick={handleNotificationClick}
                            toolbar={false}
                        />
                    </Popover>

                    </Grid>
                    </>
                ) : (
                    <>
                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} style={{paddingLeft: '5px'}}>
                            <LeftSideDrawer
                            state={state}
                            style={{float: 'left'}}
                            /> 
                        </Grid>
                        <Grid item xs={8} sm={8} md={8} lg={8} xl={8}>
                            <Logo />
                        </Grid>
                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} style={{marginTop: '3px'}}>
                            {wallet && !wallet.signedIn ? <LoginButton /> : <LogoutButton/>}
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                            <AccountInfo balance={wallet.balance} /> 
                            
                        </Grid>

                    </>
                )
            :  
            wallet && !wallet.signedIn ? 
                !matches ? (
                    <>
                    <Grid item xs={7} sm={7} md={3} lg={3} xl={3}>
                        <Logo />
                    </Grid>
                    <Grid item xs={2} sm={2} md={7} lg={7} xl={7} style={{display: 'inline-flex'}} align="center">
                        <Button style={{textAlign: 'center', marginRight: '30px'}}>About Catalyst</Button>
                        <Button style={{textAlign: 'center', marginRight: '30px'}}>Developers</Button>
                        <Button style={{textAlign: 'center', marginRight: '30px'}}>Learn</Button>
                        <Button style={{textAlign: 'center'}}>Contact</Button>
                    </Grid>
                    <Grid item xs={4} sm={4} md={2} lg={2} xl={2}>
                        {wallet && !wallet.signedIn ? <LoginButton /> : <LogoutButton  />}
                    </Grid>
                    </>
                ) : (
                    <>
                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                        <LeftSideDrawer
                            state={state}
                           
                        /> 
                    </Grid>
                    <Grid item xs={7} sm={7} md={7} lg={7} xl={7}>
                        <Logo />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} lg={4} xl={4} style={{marginTop: '3px'}} align="right">
                        {wallet && !wallet.signedIn ? <LoginButton /> : <LogoutButton />}
                    </Grid>
                    </>
                ) 
            : null
        }
            
        </Grid>
        </div>
    </>
    )
}

export default Header