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
import Dashboard from '../../components/mainPages/dashboard'
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
    
    const classes = useStyles();

    useEffect(
        () => {
            let needsKey = get(KEY_REDIRECT, [])
            if(needsKey.action == true){
                update('', {key: true})
            } else (
                update('', {key: false})
            )
    }, [userInitialized, isUpdated]
    )
   
    return (
        <>
        {userInitialized ? 
            wallet && wallet.signedIn ?  
                key ? (<SeedSetup />) : 
                    accountType == 'individual' ? (<Dashboard />) :
                        accountType == 'guild' ? (<Dashboard />) : (<UnregisteredProfile />)
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
        
    </>
    )
}
