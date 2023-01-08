import React, { useState, useContext, useEffect } from 'react'
import { appStore, onAppMount } from './state/app'
import { get, set, del } from './utils/storage'
import { Routes, Route } from "react-router-dom"
import Header from './components/common/Header/header'
import Footer from './components/common/Footer/footer'
import RandomPhrase from './components/common/RandomPhrase/randomPhrase'
import NewKey from './components/mainPages/newKey'
import Choice from './components/mainPages/choice'
import IndivRegister from './components/mainPages/indivRegister'
import GuildRegister from './components/mainPages/guildRegister'
import IndivProfile from './components/Profiles/indivProfile'
import GuildProfile from './components/Profiles/guildProfile'
import Registration from './components/mainPages/registration'
import CreateIndivProfile from './components/mainPages/createIndividualProfile'
import CreateGuildProfile from './components/mainPages/createGuildProfile'
import ExploreGuilds from './components/mainPages/guilds'
import ExploreIndividuals from './components/mainPages/individuals'
import DisplayGuildProfile from './components/mainPages/displayGuildProfile'
import DisplayIndivProfile from './components/mainPages/displayIndivProfile'
import Admin from './components/mainPages/admin'
import Pledge from './components/mainPages/pledge'
import Announcements from './components/mainPages/announcements'
import Dashboard from './components/mainPages/dashboard'
import { Home } from './components/mainPages/home'
import Leaderboards from './components/mainPages/leaderboards'
import Rewards from './components/mainPages/rewards'


// Material-UI Components
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/material/Box'



// helpers
export const btnClass = 'btn btn-sm btn-outline-primary mb-3 '
export const flexClass = 'd-flex justify-content-evenly align-items-center '
export const qs = (s) => document.querySelector(s)

const App = () => {
    
    const { state, dispatch, update } = useContext(appStore)

    
    const matches = useMediaQuery('(max-width:500px)')

    // initialize global app settings
    const onMount = () => {
        dispatch(onAppMount())
    }

    useEffect(onMount, [])

    window.onerror = function (message, url, lineNo) {
        alert('Error: ' + message + 
       '\nUrl: ' + url + 
       '\nLine Number: ' + lineNo);
    return true;   
    }    
    
    const {
        wallet
    } = state.user
    
    let children = null

    if (!wallet) {
        children = (<>
        <Box sx={{
            width: '200px',
            height: '100px',
            textAlign: 'center',
            position: 'fixed',
            top: '50%',
            left: '50%',
            marginTop: '-100px',
            marginLeft: '-100px'
        }}><CircularProgress/><br></br>
            <Typography variant="h6">Setting Things Up...</Typography>
        </Box>
        <Box sx={{
            maxWidth: '450px',
            height: '100px',
            textAlign: 'center',
            position: 'fixed',
            top: '50%',
            left: '50%',
            marginTop: '-80px',
            marginLeft: '-100px'
        }}>
            <RandomPhrase />
        </Box></>)
    }
    
    return(
        <>
        <Box sx={{
            flexGrow: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}>
        <Header />
        
        <Grid container alignItems="center" justifyContent="center" >
            <Grid item align="center" style={
                !matches ? {maxWidth: '60%'} : {maxWidth: '100%'}
            }>
            <Routes>
                <Route exact path="/" element={<Home/>}/>
                <Route exact path="/setup" element={<NewKey />}/> 
                <Route exact path="/admin" element={<Admin />}/>
                <Route exact path="/guilds" element={<ExploreGuilds />}/>
                <Route exact path="/pledge" element={<Pledge />}/>
                <Route exact path="/people" element={<ExploreIndividuals />}/>
                <Route exact path="/registration" element={<Registration />}/>
                <Route exact path="/register-individual" element={<IndivRegister />}/>
                <Route exact path="/register-guild" element={<GuildRegister />}/>
                <Route exact path="/create-guild-profile" element={<CreateGuildProfile />}/>
                <Route exact path="/announcements" element={<Announcements />}/>
                <Route exact path="/create-indiv-profile" element={<CreateIndivProfile />}/>
                <Route exact path="/indiv-profile" element={<IndivProfile />}/>
                <Route exact path="/guild-profile" element={<GuildProfile />}/>
                <Route exact path="/dashboard" element={<Dashboard />}/>
                <Route path="/guild-profiles/:guildDid" element={<DisplayGuildProfile />}/>
                <Route path="/leaderboards" element={<Leaderboards />}/>
                <Route path="/rewards" element={<Rewards />}/>
                <Route path="/indiv-profiles/:indivDid" element={<DisplayIndivProfile />}/>
            </Routes>
           </Grid>
        </Grid>

        </Box>    
        <Footer />
        </>
    )
}

export default App
