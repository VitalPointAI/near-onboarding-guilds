import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import EditProfileForm from '../EditProfile/editProfile'

// Material UI components
import { makeStyles } from '@mui/styles'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import Divider from '@mui/material/Divider'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import LinearProgress from '@mui/material/LinearProgress'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    spacing: {
      marginTop: '15px',
      marginBottom: '15px'
    },
  }));
  
export default function CreateIndivProfile(props) {

    const classes = useStyles()
    const [editProfileClicked, setEditProfileClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [profileEdit, setProfileEdit] = useState(false)
    const [loaded, setLoaded] = useState(false)

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      curUserIdx,
      did
    } = state

     useEffect(
        () => {
          if(state){
            setLoaded(true)
          }
    }, [state]
    )

    useEffect(
        () => {
          profileEdit ? window.location.assign('/'): null
    }, [profileEdit]
    )

    const handleEditProfileClick = () => {
      handleExpanded()
      handleEditProfileClickState(true)
    }
  
    function handleEditProfileClickState(property){
      setEditProfileClicked(property)
    }

    function handleProfileEdit(property){
      setProfileEdit(property)
    }

    function handleExpanded() {
      setAnchorEl(null)
    }
    
    return (
        <>
        {!loaded ? <LinearProgress /> : (
        
        <Grid container spacing={1} style={{padding: '10px'}}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
          <Typography variant="h4" style={{marginTop:'40px', marginBottom: '30px'}}>You're approaching your destination.</Typography><br></br>
          <Typography variant="h5" >Will you introduce yourself?</Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} ></Grid>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
          <List>
              <ListItem className={classes.spacing}>
                <ListItemIcon>
                  <AccountBoxIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Start building your profile."
                />
              </ListItem>
              <Divider variant="middle" />
              <ListItem className={classes.spacing}>
                <ListItemIcon>
                  <SupervisedUserCircleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Declare the skills and values you possess to help us recommend the guilds and NEAR apps that match your interests."
                />
              </ListItem>
              <Divider variant="middle" />
              <ListItem className={classes.spacing}>
              <ListItemIcon>
                <MonetizationOnIcon />
              </ListItemIcon>
              <ListItemText
                primary="Browse and join guilds, become active in the NEAR ecosystem, earn NEAR, earn rewards."
              />
            </ListItem>
            <Divider variant="middle" />
          </List>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Button className={classes.spacing} style={{float: 'left', marginRight: '15px'}} variant="contained" color="primary" onClick={handleEditProfileClick}>
                Get Started
                </Button> <Typography variant="body2" style={{marginTop: '15px'}}>It only takes a few minutes and you can edit it later.</Typography>
            </Grid>
        </Grid>
        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} ></Grid>
      </Grid>
        )}

        {editProfileClicked ? <EditProfileForm
          handleEditProfileClickState={handleEditProfileClickState}
          handleProfileEdit={handleProfileEdit}
          curUserIdx={curUserIdx}
          did={did}
          accountId={accountId}
          /> : null }
        </>
        
    )
}