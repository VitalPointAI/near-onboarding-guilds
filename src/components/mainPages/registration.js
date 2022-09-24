import React, { useState, useContext, useEffect } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { ceramic } from '../../utils/ceramic'
import { updateCurrentGuilds } from '../../state/near'

// Material UI Components
import { makeStyles } from '@mui/styles'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import CircularProgress from '@mui/material/CircularProgress'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import Divider from '@mui/material/Divider'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import StarsIcon from '@mui/icons-material/Stars'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      },
    center: {
        textAlign: 'center',
        fontWeight: 700,
        paddingTop: 30, 
        paddingBottom: 60, 
    },
    loading: {
        position: 'fixed',
        top: '40%',
        left: 'calc(50% - 80px)',
    },
    button: {
        width: '80%',
        fontSize: '40px'
    },
    waiting: {
        minWidth: '100%',
        minHeight: '100%',
        overflow: 'hidden',
        padding: '20px'
    }
}));

const Registration = () => {
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')
    const [loaded, setLoaded] = useState(false)
    const [isAdmin, setIsAdmin] = useState()
    const { state, dispatch, update } = useContext(appStore)
    const {
        accountType,
        did,
        accountId,
        isUpdated,
        admins
    } = state

useEffect(
    () => {
        async function fetchData(){
            if(isUpdated){await updateCurrentGuilds()}
            if(accountType){
                setLoaded(true)
            }
            if(admins && admins.includes(accountId)){
                setIsAdmin(true)
            } else {
                setIsAdmin(false)
            }
        }

        fetchData()
        .then((res) => {

        })

},[accountType, admins, isUpdated]
)


async function register(type){
    if(did){
        let freeContract = await ceramic.useFundingAccount(accountId)
       
        try{
            await freeContract.contract.putDID({
                accountId: accountId,
                did: did,
                type: type
            })
            update('', {accountType: type})
        } catch (err) {
        console.log('error registering', err)
        }
    }
//    location.reload()
}

async function unregister(){
    if(did){
        let freeContract = await ceramic.useFundingAccount(accountId)
      
        if(freeContract){
            try{
                await freeContract.contract.deleteDID({
                    accountId: accountId
                })
                update('', {accountType: 'none'})
            } catch (err) {
            console.log('error unregistering', err)
            }
        }
   //     location.reload()
    }
}

    return(
    <>
    {loaded ?
        !matches ?
        <Grid container justifyContent="center" alignItems="center" spacing={0} style={{padding: '10px'}} >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '30px', marginBottom:'25px'}}>
                <Typography variant="h4" align="center">
                   Manage Registration
                </Typography>
            </Grid>
    
            {accountType != 'none' ? <>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom:'20px'}}>
                    <Typography variant="h5" align="center">
                        This account is registered as a/an:<br></br>
                    <Typography variant="h4">{accountType}</Typography>
                    </Typography>
                </Grid>
                
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{margin:'5px'}}>
                    {isAdmin ?<> 
                        <Typography variant="overline">
                            This account is an admin, it cannot unregister.
                        </Typography><br></br></>
                    : null}
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={unregister}
                        disabled={isAdmin}
                    >
                        <Typography variant="body1" style={{fontSize: '40px'}}>
                            Unregister
                        </Typography>
                    </Button>
                </Grid>
                </> :
                <>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom:'20px'}}>
                    <Typography variant="h5">
                        Please confirm<br></br>
                        <b>{accountId}</b><br></br>
                        is your Guild's account.
                    </Typography>
                    <Typography variant="overline">
                        (account that manages your Guild's profile)
                    </Typography>
                </Grid>
                <Grid container spacing={1} style={{padding: '10px'}}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography variant="h6">Why register your guild?</Typography>
                    </Grid>
                   
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                    <List>
                        <ListItem className={classes.spacing}>
                            <ListItemIcon>
                            <AccountBoxIcon />
                            </ListItemIcon>
                            <ListItemText
                            primary="Showcases your guild and is the first step towards obtaining verified status and higher tier levels."
                            />
                        </ListItem>
                        <Divider variant="middle" />
                        <ListItem className={classes.spacing}>
                            <ListItemIcon>
                            <SupervisedUserCircleIcon />
                            </ListItemIcon>
                            <ListItemText
                            primary="Enables guild discoverability - making it easier for people to find, join, and participate in your guild."
                            />
                        </ListItem>
                        <Divider variant="middle" />
                        <ListItem className={classes.spacing}>
                        <ListItemIcon>
                            <StarsIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Allows your guild to show up on leaderboards and be eligible for reputation based rewards."
                        />
                        </ListItem>
                        <Divider variant="middle" />
                    </List>
                    <Grid container spacing={1} style={{marginLeft: '20px', marginRight: '20px', width:'95%'}}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                        <Button className={classes.spacing} style={{float: 'left', marginTop: '20px'}} variant="contained" color="primary" onClick={(e) => register('guild')}>
                            Register
                        </Button>
                        <Typography variant="body2" style={{marginTop: '30px'}}>
                            You can unregister at any time.
                        </Typography>
                        </Grid>
                    </Grid>
                    </Grid>
                   
                </Grid>
                </>
            }
        </Grid>
        :
        <Grid container justifyContent="center" alignItems="center" spacing={0} style={{padding: '10px'}} >
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '30px', marginBottom:'25px'}}>
            <Typography variant="h4" align="center">
            Manage Registration
            </Typography>
        </Grid>

        {accountType != 'none' ? <>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom:'20px'}}>
                <Typography variant="h5" align="center">
                This account is registered as/an:<br></br>
                <Typography variant="h4">{accountType}</Typography>
                </Typography>
            </Grid>
            
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{margin:'5px'}} align="center">
                {isAdmin ?<> 
                    <Typography variant="overline">
                        This account is an admin, it cannot unregister.
                    </Typography><br></br></>
                : null}
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={unregister}
                    disabled={isAdmin}
                >
                    <Typography variant="body1" style={{fontSize: '40px'}}>
                        Unregister
                    </Typography>
                </Button>
            </Grid>
            </> :
            <>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom:'20px'}}>
                <Typography variant="h5">
                    Please confirm<br></br>
                    <b>{accountId}</b><br></br>
                    is your Guild's account.
                </Typography>
                <Typography variant="overline">
                    (account that manages your Guild's profile)
                </Typography>
            </Grid>
            <Grid container spacing={1} style={{padding: '10px'}}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Typography variant="h6">Why register your guild?</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} ></Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                <List>
                    <ListItem className={classes.spacing}>
                        <ListItemIcon>
                        <AccountBoxIcon />
                        </ListItemIcon>
                        <ListItemText
                        primary="Showcases your guild and is the first step towards obtaining verified status and higher tier levels."
                        />
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItem className={classes.spacing}>
                        <ListItemIcon>
                        <SupervisedUserCircleIcon />
                        </ListItemIcon>
                        <ListItemText
                        primary="Enables guild discoverability - making it easier for people to find, join, and participate in your guild."
                        />
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItem className={classes.spacing}>
                    <ListItemIcon>
                        <StarsIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Allows your guild to show up on leaderboards and be eligible for reputation based rewards."
                    />
                    </ListItem>
                    <Divider variant="middle" />
                </List>
                <Grid container spacing={1} style={{marginLeft: '20px', marginRight: '20px', width:'95%'}}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Button className={classes.spacing} style={{float: 'left', marginTop: '20px'}} variant="contained" color="primary" onClick={(e) => register('guild')}>
                        Register
                    </Button>
                    <Typography variant="body2" style={{marginTop: '30px'}}>
                        You can unregister at any time.
                    </Typography>
                    </Grid>
                </Grid>
                </Grid>
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} ></Grid>
            </Grid>
            </>
        }
    </Grid>
    : <>
    <div className={classes.loading}>
    <Grid container spacing={1} alignItems="center" justifyContent="center" >
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
            <CircularProgress/>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <Typography variant="h5" align="center">Loading...</Typography>
        </Grid>
    </Grid>
    </div>
    </> 
    }    
    </>
    )
}

export default Registration