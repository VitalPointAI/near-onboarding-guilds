import React from 'react'
import ImageLoader from '../common/ImageLoader/imageLoader'
import { Link } from 'react-router-dom'
import guild from '../../img/guild.png'
import individual from '../../img/individual.png'

// Material UI Components
import { makeStyles } from '@mui/styles'
import { CardHeader, CardContent, Card } from '@mui/material'
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

const Choice = () => {
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')

    return(
    <>
   {!matches ?
        <Grid container justifyContent="center" alignItems="center" spacing={3} >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '50px', marginBottom:'40px'}}>
                <Typography variant="h4" align="center">
                   You arrive at a<br></br>
                   fork in the road.
                </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom:'20px'}}>
                <Typography variant="h5" align="center">
                Which path will you take?<br></br>
                </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                <Link to="/register-guild"> 
                    <Typography variant="h6">Guild</Typography>
                    <ImageLoader image={guild} style={{width:'70%'}}/>
                </Link>
            </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                <Link to="/register-individual"> 
                    <Typography variant="h6">Individual</Typography>
                    <ImageLoader image={individual} style={{width:'70%'}}/>
                </Link>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{margin:'5px'}}>
                <Card>
                    <CardContent>
                        <Typography variant="body1">
                            A <b>NEAR Guild</b> is a group of people with a unique identity
                            based on purpose, vision, locale or other unifying characteristic who 
                            come together to collaborate and achieve common objectives in support 
                            of the NEAR ecosystem.
                        </Typography><br></br>
                        <Typography variant="body1">
                            Choose the Guild path if you are a guild leader setting up a guild,
                            otherwise head down the individual path.
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    :
        <Grid container justifyContent="center" alignItems="center" spacing={3} >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '100px', marginBottom:'40px'}}>
                <Typography variant="h4" align="center">
                You arrive at a<br></br>
                fork in the road.
                </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginBottom:'20px'}}>
                <Typography variant="h5" align="center">
                Which path will you take?<br></br>
                </Typography>
            </Grid>
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                <Link to="/register-guild"> 
                    <Typography variant="h6">Guild</Typography>
                    <ImageLoader image={guild} style={{width:'70%'}}/>
                </Link>
            </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center">
                <Link to="/register-individual"> 
                    <Typography variant="h6">Individual</Typography>
                    <ImageLoader image={individual} style={{width:'70%'}}/>
                </Link>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{margin:'5px'}}>
                <Card>
                    <CardContent>
                        <Typography variant="body1">
                            A <b>NEAR Guild</b> is a group of people with a unique identity
                            based on purpose, vision, locale or other unifying characteristic who 
                            come together to collaborate and achieve common objectives in support 
                            of the NEAR ecosystem.
                        </Typography><br></br>
                        <Typography variant="body1">
                            Choose the Guild path if you are a guild leader setting up a guild,
                            otherwise head down the individual path.
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    }    
    </>
    )
}

export default Choice