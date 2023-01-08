import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { ceramic } from '../../utils/ceramic'

// Material UI components
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import Divider from '@mui/material/Divider'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import StarsIcon from '@mui/icons-material/Stars'

export default function GuildRegister(props) {

    

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      did,
      accountType
    } = state
   
    useEffect(
        () => {
          if(accountType){
            let urlVariables = window.location.search
            const urlParameters = new URLSearchParams(urlVariables)
            let transactionHash = urlParameters.get('transactionHashes')
            accountType == 'guild' ? window.location.assign('/create-guild-profile') : null
          }
    }, [accountType]
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
      location.reload()
    }

    function handleNo(){
      window.location.assign('/create-guild-profile')
    }
    
    return (
        <>
        <Grid container spacing={1} style={{padding: '10px'}}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
          <Typography variant="h4" style={{marginTop:'40px', marginBottom: '40px'}}>To be found or not to be found?</Typography>
          <Typography variant="h6" style={{marginTop:'40px'}}>Decide if you want to register your guild.</Typography>
        </Grid>
        
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
          <List>
              <ListItem sx={{marginTop: '15px',
              marginBottom: '15px'}}>
                <ListItemIcon>
                  <AccountBoxIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Showcases your guild and is the first step towards obtaining verified status and higher tier levels."
                />
              </ListItem>
              <Divider variant="middle" />
              <ListItem sx={{marginTop: '15px',
              marginBottom: '15px'}}>
                <ListItemIcon>
                  <SupervisedUserCircleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Enables guild discoverability - making it easier for people to find, join, and participate in your guild."
                />
              </ListItem>
              <Divider variant="middle" />
              <ListItem sx={{marginTop: '15px',
              marginBottom: '15px'}}>
              <ListItemIcon>
                <StarsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Allows your guild to show up on leaderboards and be eligible for reputation based rewards."
              />
            </ListItem>
            <Divider variant="middle" />
          </List>
          <Grid container spacing={1} style={{padding: '10px'}}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
              <Button sx={{marginTop: '15px',
              marginBottom: '15px'}} style={{float: 'left', marginTop: '20px', marginRight: '15px'}} variant="contained" color="primary" onClick={(e) => register('guild')}>
                Register
              </Button>
              <Typography variant="body2" style={{marginTop: '30px'}}>
                You can unregister at any time.
              </Typography>
              <div style={{clear:'both'}} />
              <Button
                color="secondary"
                style={{marginTop: '20px'}}
                onClick={handleNo}
              >
                No Thanks
              </Button>
            </Grid>
          </Grid>
        </Grid>
       
      </Grid>
        </>
        
    )
}