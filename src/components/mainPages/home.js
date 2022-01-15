import React, { useState, useEffect, useContext } from 'react'
import { get, set, del } from '../../utils/storage'
import { appStore, onAppMount } from '../../state/app';
import { flexClass } from '../../App'
import Footer from '../../components/common/Footer/footer'
import SeedSetup from '../SeedSetup/seedSetup'
import Header from '../../components/common/Header/header'
import RandomPhrase from '../../components/common/RandomPhrase/randomPhrase'
import Landing from '../../components/mainPages/landing'
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
        key
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
    }, [finished]
    )

    return (
        <>
        {finished ? 
            wallet && wallet.signedIn ?  
                key ? (<><div className={classes.root}>
                        <Header state={state}/>
                            <SeedSetup />
                        </div>
                        <Footer />
                        </>) 
                    : (<>
                        <div className={classes.root}>
                        <Header state={state}/>
                            <Landing />
                        </div>
                        <Footer />
                        </>)
            :  (
                <div className={classes.root}>
                    <Header state={state}/>
                    <Landing />
                    <Footer />
                </div>)
            : state.accountData ? (<>
                <div className={classes.root}>
                <Header state={state}/>
                    {children}
                </div>
                <Footer /></>
            ) 
            : (<><div className={classes.root}>
                <Header state={state}/>
                <div className={classes.centered}>
                    <CircularProgress/><br></br>
                    <Typography variant="h6">Finding Gems...</Typography><br></br>
                    <RandomPhrase />
                </div>
               
                </div>
                <Footer />
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
