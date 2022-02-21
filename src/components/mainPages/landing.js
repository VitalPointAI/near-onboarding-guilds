import React, { useState } from 'react'
import globe from '../../img/globe.png'
import { Link } from 'react-router-dom'

// Material UI Components
import { makeStyles } from '@mui/styles'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'


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

const steps = [
    {
      label: 'Step 1: Take the Pledge',
      description: `Each guild shares a specific vision and mission related to driving 
      a more open, interconnected and consumer-empowered word. You must pledge 
      to operate your Guild in a manner that reflects positively
      on the NEAR ecosystem.`,
    },
    {
      label: 'Step 2: Describe your Guild',
      description:
        `After choosing and signing in with your guild's NEAR account, you'll create it's
        profile. Describe your guild's vision, purpose and values.  List it's desired
        skills and competences, contact information, logo, and other information
        to make it easy for people to find and join your guild. This is the first
        step to guild verification and tiering.`,
    },
    {
      label: 'Step 3: Manage your Guild',
      description: `Grow your guild using the guild platform to interact with other guild leaders,
      be notified of opportunities and collaborations, manage your members, and 
      access the analytics that show how your guild is contributing to the 
      growth of the ecosystem. See the milestones your guild needs to reach
      to move up in tiering, unlocking new possibilities and status.`,
    },
]

const Landing = (state) => {
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')
    const [activeStep, setActiveStep] = useState(0)
  

    return(
    <>
      
    {!matches ?
            <Grid container justifyContent="center" alignItems="center" spacing={0}>
               
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <img src={globe} style={{width: '75%', marginTop: '20px'}}/>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography variant="h4" style={{marginTop: '15px', marginBottom: '15px'}}>Make your vision real.</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Accordion style={{marginLeft: '10px', marginRight:'10px'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography style={{fontSize: '1.5em'}}>{steps[0].label}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography align="left">
                   {steps[0].description}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion style={{marginLeft: '10px', marginRight:'10px'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <Typography style={{fontSize: '1.5em'}}>{steps[1].label}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography align="left">
                   {steps[1].description}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion style={{marginLeft: '10px', marginRight:'10px'}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3a-content"
                    id="panel3a-header"
                >
                    <Typography style={{fontSize: '1.5em'}}>{steps[2].label}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography align="left">
                    {steps[2].description}
                    </Typography>
                </AccordionDetails>
                </Accordion>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                   <Link to="/pledge">
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        style={{marginTop: '20px', marginBottom: '20px'}}
                    ><PlayCircleFilledWhiteIcon style={{marginRight: '5px'}}/>
                        <Typography variant="body1" style={{fontSize: '26px'}}>
                            Let's Go
                        </Typography>
                    </Button>
                    </Link>
                </Grid>
            </Grid>
        :
            <Grid container justifyContent="center" alignItems="center" spacing={0} >
              
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <img src={globe} style={{width: '75%', marginTop: '20px'}}/>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography variant="h4" style={{marginTop: '15px', marginBottom: '15px'}}>Make your vision real.</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Accordion style={{marginLeft: '10px', marginRight:'10px'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography style={{fontSize: '1.5em'}}>{steps[0].label}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography align="left">
                   {steps[0].description}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion style={{marginLeft: '10px', marginRight:'10px'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <Typography style={{fontSize: '1.5em'}}>{steps[1].label}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography align="left">
                   {steps[1].description}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion style={{marginLeft: '10px', marginRight:'10px'}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3a-content"
                    id="panel3a-header"
                >
                    <Typography style={{fontSize: '1.5em'}}>{steps[2].label}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography align="left">
                    {steps[2].description}
                    </Typography>
                </AccordionDetails>
                </Accordion>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '15px'}}>
                   <Link to="/pledge">
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        style={{marginTop: '20px', marginBottom: '20px'}}
                    ><PlayCircleFilledWhiteIcon style={{marginRight: '5px'}}/>
                        <Typography variant="body1" style={{fontSize: '26px'}}>
                            Let's Go
                        </Typography>
                    </Button>
                    </Link>
                </Grid>
            </Grid>
    }
    </>
    )
}

export default Landing