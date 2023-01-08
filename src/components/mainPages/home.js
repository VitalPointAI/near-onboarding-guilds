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
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import '../../global.css'

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
        catalystContract,
        key
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
    
    ;

    useEffect(
        () => {
            let needsKey = get(KEY_REDIRECT, [])
            if(needsKey.action == true){
                update('user', {key: true})
            } else (
                update('user', {key: false})
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
                <Box sx={{width: '200px',
                height: '100px',
                textAlign: 'center',
                position: 'fixed',
                top: '50%',
                left: '50%',
                marginTop: '-100px',
                marginLeft: '-100px'}}>
                    <CircularProgress/><br></br>
                    <Typography variant="h6">Preparing...</Typography><br></br>
                    <RandomPhrase />
                </Box>
            </>)
        }    
        
    </>
    )
}
