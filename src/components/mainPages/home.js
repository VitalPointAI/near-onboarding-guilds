import React, { useState, useEffect, useContext } from 'react'
import { get, set, del } from '../../utils/storage'
import { appStore, onAppMount } from '../../state/app'
import { flexClass } from '../../App'
import SeedSetup from '../SeedSetup/seedSetup'
import IndivProfile from '../Profiles/indivProfile'
import GuildProfile from '../Profiles/guildProfile'
import UnregisteredProfile from '../Profiles/unregisteredProfile'
import RandomPhrase from '../../components/common/RandomPhrase/randomPhrase'
import Landing from './landing'
import { KEY_REDIRECT } from '../../utils/ceramic'

// Material UI & styling
import { makeStyles } from '@mui/styles'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import '../../global.css'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      },
      centered: {
        width: '200px',
        height: '100px',
        textAlign: 'center',
        position: 'fixed',
        top: '50%',
        left: '50%',
        marginTop: '-100px',
        marginLeft: '-100px'
      },
  }));

export const Home = ({ children }) => {

    const { state, update } = useContext(appStore)
   
    const {
        wallet, 
        finished,
        key,
        accountType,
        isUpdated
    } = state
    
    const classes = useStyles();

    useEffect(
        () => {
            let needsKey = get(KEY_REDIRECT, [])
            if(needsKey.action == true){
                update('', {key: true})
            } else (
                update('', {key: false})
            )
    }, [finished, isUpdated]
    )
   
    return (
        <>
        {finished ? 
            wallet && wallet.signedIn ?  
                key ? (<SeedSetup />) : 
                    accountType == 'individual' ? (<IndivProfile />) :
                        accountType == 'guild' ? (<GuildProfile/>) : (<UnregisteredProfile />)
            :  (<Landing state={state} />)
            : state.accountData ? ({children}) 
            : (<>
                <div className={classes.centered}>
                    <CircularProgress/><br></br>
                    <Typography variant="h6">Preparing...</Typography><br></br>
                    <RandomPhrase />
                </div>
            </>)
        }    
       
        { state.app.alert &&
            <div class="container-alert">
                <div class={flexClass + ' mt-0'}>
                    <div class="container container-custom mt-0">
                        <div class="alert alert-primary mt-0" role="alert">
                            {state.app.alert}
                        </div>
                    </div>
                </div>
            </div>
        }
        
    </>
    )
}
