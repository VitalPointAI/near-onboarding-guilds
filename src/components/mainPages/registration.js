import React, { useState, useContext, useEffect } from 'react'
import ImageLoader from '../common/ImageLoader/imageLoader'
import { appStore, onAppMount } from '../../state/app'
import * as nearApiJs from 'near-api-js'
import { Link } from 'react-router-dom'
import { flexClass } from '../../App'
import guild from '../../img/guild.png'
import individual from '../../img/individual.png'
import { ceramic } from '../../utils/ceramic'
import { 
    parseNearAmount, 
    STORAGE, 
    GAS, 
    NO_GAS, 
    networkId,
    nodeUrl,
    walletUrl,
    InMemorySigner,
    keyStores } from '../../state/near'

// Material UI Components
import { makeStyles } from '@mui/styles'
import { CardContent, Card } from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import CircularProgress from '@mui/material/CircularProgress'

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
            if(isUpdated){}
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
        let freeContract = await ceramic.useFundingAccount()
       
        try{
            await freeContract.contract.putDID({
                accountId: accountId,
                did: did,
                type: type
            })
           
        } catch (err) {
        console.log('error registering', err)
        }
    }
    location.reload()
}

async function unregister(){
    if(did){
        let freeContract = await ceramic.useFundingAccount()
      
        if(freeContract){
            try{
                await freeContract.contract.deleteDID({
                    accountId: accountId
                })
                
            } catch (err) {
            console.log('error unregistering', err)
            }
        }
        location.reload()
    }
}

    return(
    <>
    {loaded ?
        !matches ?
        <Grid container justifyContent="center" alignItems="center" spacing={3} >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '50px', marginBottom:'40px'}}>
                <Typography variant="h4" align="center">
                   Manage Registration
                </Typography>
            </Grid>

            {accountType != 'not registered' ? <>
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
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom:'20px'}}>
                    <Typography variant="h5" align="center">
                    What kind of account is this?<br></br>
                    </Typography>
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                    <Typography variant="h6">Guild</Typography><br></br>    
                    <Button onClick={(e) => register('guild')}>
                        <ImageLoader image={guild} style={{width:'70%'}}/>
                    </Button>
                </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                        <Typography variant="h6">Individual</Typography><br></br>    
                        <Button onClick={(e) => register('individual')}>
                            <ImageLoader image={individual} style={{width:'70%'}}/>
                        </Button>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{margin:'5px'}}>
                    <Card>
                        <CardContent>
                            <Typography variant="body1">
                                A <b>NEAR Guild</b> is a group of people with a unique identity
                                based on purpose, vision, locale or other unifying characteristic who 
                                come together to collaborate and achieve common objectives in support 
                                of the NEAR ecosystem.
                            </Typography><br></br>
                            <Typography variant="body1">
                                Register as a Guild if you are a guild leader setting up a guild,
                                otherwise register as an individual.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                </>
            }
        </Grid>
        :
        <Grid container justifyContent="center" alignItems="center" spacing={3} >
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '50px', marginBottom:'40px'}}>
            <Typography variant="h4" align="center">
            Manage Registration
            </Typography>
        </Grid>

        {accountType != 'not registered' ? <>
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
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom:'20px'}}>
                <Typography variant="h5" align="center">
                What kind of account is this?<br></br>
                </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                <Typography variant="h6">Guild</Typography><br></br>    
                <Button onClick={(e) => register('guild')}>
                    <ImageLoader image={guild} style={{width:'70%'}}/>
                </Button>
            </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                    <Typography variant="h6">Individual</Typography><br></br>    
                    <Button onClick={(e) => register('individual')}>
                        <ImageLoader image={individual} style={{width:'70%'}}/>
                    </Button>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{margin:'5px'}}>
                <Card>
                    <CardContent>
                        <Typography variant="body1">
                            A <b>NEAR Guild</b> is a group of people with a unique identity
                            based on purpose, vision, locale or other unifying characteristic who 
                            come together to collaborate and achieve common objectives in support 
                            of the NEAR ecosystem.
                        </Typography><br></br>
                        <Typography variant="body1">
                            Register as a Guild if you are a guild leader setting up a guild,
                            otherwise register as an individual.
                        </Typography>
                    </CardContent>
                </Card>
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