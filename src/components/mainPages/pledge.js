import React, { useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import oath from '../../img/oath.png'
import { login } from '../../state/near'

// Material UI Components
import { makeStyles } from '@mui/styles'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import GavelIcon from '@mui/icons-material/Gavel'
import { Paper } from '@mui/material'

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
        fontSize: '40px',
        marginBottom: '20px'
    }
}));

export default function Pledge(props) {
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')

    const { state, dispatch, update } = useContext(appStore)

    const {
        wallet
    } = state
  
    return(
    <>
      
    {!matches ?
            <Grid container justifyContent="center" alignItems="center" spacing={3}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Paper style={{padding: '5px', margin:'10px'}}>
                <Typography variant="h4" style={{fontSize: '2em'}}>
                    Guilds are the lifeblood of the
                    NEAR Ecosystem.
                </Typography>
                </Paper>
                </Grid>
               
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <img src={oath} style={{width: '98%'}} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '30px'}}>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={login}
                    ><GavelIcon style={{marginRight: '5px'}}/>
                        <Typography variant="body1" style={{fontSize: '26px'}}>
                            I Pledge
                        </Typography>
                    </Button><br></br>
                    <Typography variant="caption" style={{lineHeight: '1em'}}>
                    <b>Note:</b> The account you use becomes the Guild's profile account. Choose wisely.
                    </Typography>
                </Grid>
               
            </Grid>
        :
            <Grid container justifyContent="center" alignItems="center" spacing={3} >
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Paper style={{padding: '5px', margin: '10px'}}>
                <Typography variant="h4" style={{fontSize: '2em'}}>
                    Guilds are the lifeblood of the
                    NEAR Ecosystem.
                </Typography>
                </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <img src={oath} style={{width: '98%'}} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom: '30px'}}>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={login}
                    ><GavelIcon style={{marginRight: '5px'}}/>
                        <Typography variant="body1" style={{fontSize: '26px'}}>
                            I Pledge
                        </Typography>
                    </Button><br></br>
                    <Typography variant="caption" style={{lineHeight: '1em'}}>
                    <b>Note:</b> The account you use becomes the Guild's profile account. Choose wisely.
                    </Typography>
                </Grid>
               
            </Grid>
    }
    </>
    )
}