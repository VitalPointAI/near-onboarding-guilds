import React from 'react'
import map from '../../img/map.png'
import { login } from '../../state/near'

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
    button: {
        width: '80%',
        fontSize: '40px'
    }
}));

const Landing = (state) => {
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')
  
    return(
    <>
      
    {!matches ?
            <Grid container justifyContent="center" alignItems="center" spacing={3} >
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '100px', marginBottom:'40px'}}>
                    <Typography variant="h4" align="center">
                    Your NEAR journey<br></br>
                    begins here.
                    </Typography>
                </Grid>
            
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={login}
                    >
                        <Typography variant="body1" style={{fontSize: '40px'}}>
                            Get Started
                        </Typography>
                    </Button>

                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <img src={map} style={{width: '75%', marginTop:'40px'}}/>
                </Grid>
            </Grid>
        :
            <Grid container justifyContent="center" alignItems="center" spacing={3} >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '100px', marginBottom:'40px'}}>
                    <Typography variant="h4" align="center">
                    Your NEAR journey<br></br>
                    begins here.
                    </Typography>
                </Grid>
            
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={login}
                    >
                        <Typography variant="body1" style={{fontSize: '40px'}}>
                            Get Started
                        </Typography>
                    </Button>

                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <img src={map} style={{width: '75%', marginTop:'40px'}}/>
                </Grid>
            </Grid>
    }
    </>
    )
}

export default Landing