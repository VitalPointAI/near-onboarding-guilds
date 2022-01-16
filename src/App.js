import React, { useState, useContext, useEffect } from 'react'
import { appStore, onAppMount } from './state/app'
import { get, set, del } from './utils/storage'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams
  } from "react-router-dom"
import RandomPhrase from './components/common/RandomPhrase/randomPhrase'
import NewKey from './components/mainPages/newKey'
import Profile from './components/mainPages/profile'
import Register from './components/mainPages/register'
import { KEY_REDIRECT } from './utils/ceramic'
//import { Container } from './components/Container'
//import { Receiver } from './components/Receiver'
//import { PersonaPage } from './components/mainPages/personas'
// import ExploreDaos from './components/mainPages/exploreDaos'
// import AppFramework from './components/AppFramework/appFramework'
// import NewKey from './components/mainPages/newKey'
// import Profile from './components/mainPages/profile'
// import Register from './components/mainPages/register'
import { Home } from './components/mainPages/home'
// import Daos from './components/mainPages/daos'
// import Developers from './components/mainPages/developers'
// import Supporters from './components/mainPages/supporters'
// import FAQ from './components/LandingSite/FAQ'
// import ArtStory from './components/LandingSite/artistStory.js'
// import NearStory from './components/LandingSite/nearStory.js'
// import ReceiveInvite from './components/Invite/Receiver'
// import Opportunities from './components/mainPages/opportunities'
// import MintFT from './components/mainPages/mintFT'
// import FTs from './components/mainPages/fts'
// import CommunityStreamIntro from './components/mainPages/communityStreamIntro'

// Material-UI Components
import { makeStyles } from '@mui/styles'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// helpers
export const btnClass = 'btn btn-sm btn-outline-primary mb-3 '
export const flexClass = 'd-flex justify-content-evenly align-items-center '
export const qs = (s) => document.querySelector(s)

const useStyles = makeStyles((theme) => ({
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
    centeredPhrase: {
        maxWidth: '450px',
        height: '100px',
        textAlign: 'center',
        position: 'fixed',
        top: '50%',
        left: '50%',
        marginTop: '-80px',
        marginLeft: '-100px'
      },
    }));

const App = () => {
    
    const { state, dispatch, update } = useContext(appStore)

    const classes = useStyles()

    const onMount = () => {
        dispatch(onAppMount());
    };

    useEffect(onMount, []);

    window.onerror = function (message, url, lineNo) {
        alert('Error: ' + message + 
       '\nUrl: ' + url + 
       '\nLine Number: ' + lineNo);
    return true;   
    }    
    
    const {
        accountData, funding, wallet
    } = state
    
    let children = null

    if (!accountData || !wallet) {
        children = (<>
        <div className={classes.centered}><CircularProgress/><br></br>
            <Typography variant="h6">Setting Things Up...</Typography>
        </div>
        <div className={classes.centeredPhrase}>
            <RandomPhrase />
        </div></>)
    }

    // if (accountData) {
    //     children = <Receiver {...{ state, dispatch }} />
    // }

    // if (funding) {
    //     children = <div class="container container-custom">
    //         <h2>DO NOT CLOSE OR REFRESH THIS PAGE</h2>
    //         <h2>Creating Persona...</h2>
    //     </div>
    // }

    // if (wallet) {
    //     children = <PersonaPage {...{ state, dispatch, update }} />

    // }
    
    return(
        <Router>
            <Switch>
                <Route exact path="/">
                    <Home 
                        state={state}
                     >
                        { children }
                    </Home>
                </Route>
                <Route exact path="/setup">
                    <NewKey 
                        state={state}
                     >
                        { children }
                    </NewKey>
                </Route>
                <Route exact path="/profile">
                    <Profile 
                        state={state}
                     >
                        { children }
                    </Profile>
                </Route>
                <Route exact path="/register">
                <Profile 
                    state={state}
                 >
                    { children }
                </Profile>
            </Route>
            </Switch>
        </Router>
    )
}

export default App
