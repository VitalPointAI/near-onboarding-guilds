import React, { useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'

// Material UI Components
import { makeStyles } from '@mui/styles'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
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

export default function Rewards(props) {
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
                    <Typography variant="h6" style={{fontSize: '2em'}}>
                        Still working on this and it's going to be great.<br></br><br></br>Turn on email notifications and we'll let you know when it's ready.
                    </Typography>
                </Paper>
            </Grid>               
        </Grid>
        :
        <Grid container justifyContent="center" alignItems="center" spacing={3} >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Paper style={{padding: '5px', margin:'10px'}}>
                    <Typography variant="h6" style={{fontSize: '2em'}}>
                        Still working on this and it's going to be great.<br></br><br></br>Turn on email notifications and we'll let you know when it's ready.
                    </Typography>
                </Paper>
            </Grid>               
        </Grid>
    }
    </>
    )
}