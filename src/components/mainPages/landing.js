import React from 'react'
import ImageLoader from '../common/ImageLoader/imageLoader'
import spaceGemLogo from '../../img/space-gem-logo.png'
import office from '../../img/office.png'
import parking from '../../img/parking.png'

// Material UI Components
import { makeStyles } from '@mui/styles'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

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
    bottomtext:{
        textAlign: 'center',
        fontWeight: 700,
        paddingTop: 30, 
    },
    button: {
        marginTop: 50, 
        backgroundColor: '#ffa366',
        boxShadow: '3px 5px',
        margin: 'auto',
    },
    button2:
    {
        marginTop: 20, 
        backgroundColor: '#ffa366',
        boxShadow: '3px 5px',
        margin: 'auto',
        textAlign: 'center',
        color: "black",
        width: 300, 
        height: 40,
    },
      specialtext: { 
        textAlign: 'center',
        fontWeight: 700,
        paddingBottom: 60, 
        backgroundImage: '-webkit-linear-gradient(45deg, #ff9966, #ff5500)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
}));

const Landing = () => {
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')

    return(
    <>
    
   <div>
   {!matches ?
        <Grid container justifyContent="center" alignItems="center" spacing={3} >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '50px', marginBottom: '25px'}}>
                <ImageLoader image={spaceGemLogo} style={{width:'70%'}}/>
            </Grid> 
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography variant="h5" align="center">
                   Find Your Space.
                </Typography>
                <Typography variant="h4" align="center" style={{marginBottom: '20px'}}>
                   Claim your Gem.
                </Typography><br></br>
            </Grid>
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                <Typography variant="h6">Office</Typography>
                <ImageLoader image={office} style={{width:'70%'}}/>
            </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                <Typography variant="h6">Parking</Typography>
                <ImageLoader image={parking} style={{width:'70%'}}/>
            </Grid>
        </Grid>
    :
        <Grid container justifyContent="center" alignItems="center" spacing={3} >
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '50px', marginBottom: '25px'}}>
        <ImageLoader image={spaceGemLogo} style={{width:'70%'}}/>
        </Grid> 
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <Typography variant="h5" align="center">
            Find Your Space.
            </Typography>
            <Typography variant="h4" align="center" style={{marginBottom: '20px'}}>
            Claim your Gem.
            </Typography><br></br>
        </Grid>
        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
            <Typography variant="h6">Office</Typography>
            <ImageLoader image={office} style={{width:'70%'}}/>
        </Grid>
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
            <Typography variant="h6">Parking</Typography>
            <ImageLoader image={parking} style={{width:'70%'}}/>
        </Grid>
        </Grid>
    }
    </div>
    
    </>
    )
}

export default Landing