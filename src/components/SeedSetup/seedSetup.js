import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app';
import { useForm } from 'react-hook-form'
import { get, set, del } from '../../utils/storage'
import confidential from '../../img/confidential.png'

// Material UI components
import { makeStyles, withStyles } from '@mui/styles'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Tooltip from '@mui/material/Tooltip'
import InfoIcon from '@mui/icons-material/Info'
import useMediaQuery from '@mui/material/useMediaQuery'

import { ACCOUNT_LINKS } from '../../state/near'

const bip39 = require('bip39')
const base58 = require('bs58')

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 50
  },
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  paper: {
    padding: '20px',
    textAlign: 'center',
    color: '#000000',
  },
  customCard: {
    maxWidth: 300,
    minWidth: 275,
    margin: 'auto',
    padding: 20
  },
  rootForm: {
    '& > *': {
      margin: '10px',
    },
  },
  heading: {
    fontSize: '24px',
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: '18px',
    color: '#000000',
  },
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: '20px',
    },
  },
  }));

  const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: '100px',
      fontSize: '12px',
      border: '1px solid #dadde9',
    },
  }))(Tooltip)

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function Import(props) {
    const [seedPhrase, setSeedPhrase] = useState(bip39.generateMnemonic())
    const [seedHidden, setSeedHidden] = useState(true)
    const [exists, setExists] = useState(true)
    const [recoverSeed, setRecoverSeed] = useState('')
    const [expanded, setExpanded] = useState(false)
    
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')

    const { register, handleSubmit, watch, errors } = useForm()

    const { state, dispatch, update } = useContext(appStore);

    const {
      accountId
    } = state
    
    const handleRecoverSeed = (event) => {
    let lowercase = (event.target.value).toLowerCase()
    setRecoverSeed(lowercase)
    }

    const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    }

    // replaces existing key complete - no recover
    const onSubmit = async (values) => {
    let currentAccounts = get(ACCOUNT_LINKS, [])
    let i = 0
    while (i < currentAccounts.length) {
        if(currentAccounts[i].accountId == accountId){
        currentAccounts.splice[i,1]
        break
        }
        i++
    }

    let newAccount = { key: (base58.encode(await bip39.mnemonicToSeed(seedPhrase))), accountId: accountId, owner: accountId, keyStored: Date.now() }
    currentAccounts.push(newAccount)
    set(ACCOUNT_LINKS, currentAccounts)
    update('', {key: false})
    window.location.assign('/register-guild')
    }

    // recovers an existing key
    const onRecover = async (values) => {
    let currentAccounts = get(ACCOUNT_LINKS, [])
    let i = 0
    while (i < currentAccounts.length) {
        if(currentAccounts[i].accountId == accountId){
        currentAccounts.splice[i,1]
        break
        }
        i++
    }

    let newAccount = { key: (base58.encode(await bip39.mnemonicToSeed(recoverSeed))), accountId: accountId, owner: accountId, keyStored: Date.now() }
    currentAccounts.push(newAccount)
    set(ACCOUNT_LINKS, currentAccounts)
    update('', {key: false})
    window.location.assign('/')
    }

      return (
        <>
       {!matches ?
        <Grid container spacing={1}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
            <Typography variant="h4" style={{marginTop:'40px'}}>You've Founded a Guild</Typography><br></br>
            <Typography variant="h5" style={{marginTop:'20px', marginBottom: '20px'}}>Now secure it's data!</Typography>
              
                <Typography variant="body1">What's a secret phrase and why do you need one?
                <HtmlTooltip
                title={
                  <>
                      <Typography variant="h6">What's a Secret Phrase?</Typography>

                      <Typography variant="body2">NEAR Guilds is an open web application that gives
                      you complete control of your guild's data.</Typography>
                      <br></br>
                      <Typography variant="body2">This secret phrase is like a long password. It
                      allows you to access your data to add, update, or delete at will.
                      </Typography>
                      <br></br>
                      <Typography variant="body2">You need to keep it safe. Nobody else, including NEAR Guilds,
                      can change your guild's data without your secret phrase.
                      </Typography>
                      <br></br>
                      <Typography variant="body2">
                      Your Guild's secret phrase is the secret phrase to it's unique identity, not it's wallet. 
                      You <b>SHOULD NOT USE</b> the account's wallet seed phrase as the Guild's secret phrase.
                      </Typography>
                  </>
                }
                placement="left"
                ><InfoIcon />
                </HtmlTooltip>
                </Typography>
            <Typography variant="h6" style={{marginTop: '20px', marginBottom:'20px'}}>Choose your situation:</Typography>
          </Grid>
        
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginLeft: '10px', marginRight: '10px'}}>
          <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={classes.heading}>Option 1</Typography>
            <Typography className={classes.secondaryHeading}>
              You do not have your Guild's secret phrase.
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Card>
          <CardHeader 
            title="New Guild?"
            align="center"
          />
          <CardContent>
            <Typography variant="body1" gutterBottom>This sets a new 12 word secret phrase for this guild's data stream.</Typography>
            <Typography variant="body1" gutterBottom>It does not allow access to this account's wallet. Protect it like any other secret key.</Typography>
            <Typography variant="body1" gutterBottom>We cannot recover this phrase for you. As the guild leader, it is your responsibility to keep it safe.</Typography>
            <div class="form-floating mb-3" align="center">
            {seedHidden && <Button color="primary" style={{marginBottom: '10px'}} onClick={() => { setSeedHidden(!seedHidden) }}>
                REVEAL GUILD'S SECRET PHRASE
            </Button>}
           
                <textarea readonly class="form-control" id="seedPhrase" value={seedHidden ? `************` : seedPhrase} style={{marginTop: '10px', marginBottom: '10px'}}/>
            
            {!seedHidden && <Button color="primary" onClick={handleSubmit(onSubmit)}>
                  I Wrote It Down in Order! Set It!
              </Button>
            }
            </div>
          </CardContent>
          </Card>
          </AccordionDetails>
        </Accordion>
       
        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
          >
            <Typography className={classes.heading}>Option 2</Typography>
            <Typography className={classes.secondaryHeading}>You have the Guild's 
            secret phrase and need to restore it.</Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Card>
          <CardHeader 
            title="Have the Guild's Secret Phrase?"
            align="center"
          />
          <CardContent>
            <Typography variant="body1" gutterBottom>If you have your Guild's 12 word secret phrase, enter it below.</Typography>
            <Typography variant="body1" gutterBottom><b>Please DO NOT USE use the Guild's wallet seed phrase.</b></Typography>
            <div class="form-floating mb-3" align="center">
                <div>
                  <TextField
                      fullWidth
                      id="recoverPhrase"
                      placeholder="12 word seed phrase"
                      margin="dense"
                      variant="outlined"
                      name="id"
                      label="12 Word Recovery Secret Phrase"
                      helperText="12 words, 1 space between each word"
                      value={recoverSeed}
                      onChange={handleRecoverSeed}
                  />
                </div>
              <Button color="primary" onClick={handleSubmit(onRecover)}>
                  Recover It!
              </Button>
            </div>
          </CardContent>
          </Card>
          </AccordionDetails>
        </Accordion>
          </Grid>
        
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
            <img src={confidential} style={{width:'80%', marginTop:'20px'}}/>
          </Grid>
        </Grid>
        :
        <Grid container spacing={1}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
            <Typography variant="h4" style={{marginTop:'40px'}}>You've Founded a Guild</Typography><br></br>
            <Typography variant="h5" style={{marginTop:'20px', marginBottom: '20px'}}>Now secure it's data!</Typography>
              
                <Typography variant="body1">What's a secret phrase and why do you need one?
                <HtmlTooltip
                title={
                  <>
                      <Typography variant="h6">What's a Secret Phrase?</Typography>

                      <Typography variant="body2">NEAR Guilds is an open web application that gives
                      you complete control of your guild's data.</Typography>
                      <br></br>
                      <Typography variant="body2">This secret phrase is like a long password. It
                      allows you to access your data to add, update, or delete at will.
                      </Typography>
                      <br></br>
                      <Typography variant="body2">You need to keep it safe. Nobody else, including NEAR Guilds,
                      can change your guild's data without your secret phrase.
                      </Typography>
                      <br></br>
                      <Typography variant="body2">
                      Your Guild's secret phrase is the secret phrase to it's unique identity, not it's wallet. 
                      You <b>SHOULD NOT USE</b> the account's wallet seed phrase as the Guild's secret phrase.
                      </Typography>
                  </>
                }
                placement="left"
                ><InfoIcon />
                </HtmlTooltip>
                </Typography>
            <Typography variant="h6" style={{marginTop: '20px', marginBottom:'20px'}}>Choose your situation:</Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={3} lg={3} xl={3} ></Grid>
          <Grid item xs={12} sm={12} md={6} lg={6} xl={6} style={{marginLeft: '10px', marginRight: '10px'}}>
          <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={classes.heading}>Option 1</Typography>
            <Typography className={classes.secondaryHeading}>
              You do not have your Guild's secret phrase.
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Card>
          <CardHeader 
            title="New Guild?"
            align="center"
          />
          <CardContent>
            <Typography variant="body1" gutterBottom>This sets a new 12 word secret phrase for this guild's data stream.</Typography>
            <Typography variant="body1" gutterBottom>It does not allow access to this account's wallet. Protect it like any other secret key.</Typography>
            <Typography variant="body1" gutterBottom>We cannot recover this phrase for you. As the guild leader, it is your responsibility to keep it safe.</Typography>
            <div class="form-floating mb-3" align="center">
            {seedHidden && <Button color="primary" style={{marginBottom: '10px'}} onClick={() => { setSeedHidden(!seedHidden) }}>
                REVEAL GUILD'S SECRET PHRASE
            </Button>}
           
                <textarea readonly class="form-control" id="seedPhrase" value={seedHidden ? `************` : seedPhrase} style={{marginTop: '10px', marginBottom: '10px'}}/>
            
            {!seedHidden && <Button color="primary" onClick={handleSubmit(onSubmit)}>
                  I Wrote It Down in Order! Set It!
              </Button>
            }
            </div>
          </CardContent>
          </Card>
          </AccordionDetails>
        </Accordion>
       
        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
          >
            <Typography className={classes.heading}>Option 2</Typography>
            <Typography className={classes.secondaryHeading}>You have the Guild's 
            secret phrase and need to restore it.</Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Card>
          <CardHeader 
            title="Have the Guild's Secret Phrase?"
            align="center"
          />
          <CardContent>
            <Typography variant="body1" gutterBottom>If you have your Guild's 12 word secret phrase, enter it below.</Typography>
            <Typography variant="body1" gutterBottom><b>Please DO NOT USE use the Guild's wallet seed phrase.</b></Typography>
            <div class="form-floating mb-3" align="center">
                <div>
                  <TextField
                      fullWidth
                      id="recoverPhrase"
                      placeholder="12 word seed phrase"
                      margin="dense"
                      variant="outlined"
                      name="id"
                      label="12 Word Recovery Secret Phrase"
                      helperText="12 words, 1 space between each word"
                      value={recoverSeed}
                      onChange={handleRecoverSeed}
                  />
                </div>
              <Button color="primary" onClick={handleSubmit(onRecover)}>
                  Recover It!
              </Button>
            </div>
          </CardContent>
          </Card>
          </AccordionDetails>
        </Accordion>
          </Grid>
          <Grid item xs={12} sm={12} md={3} lg={3} xl={3} ></Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" >
            <img src={confidential} style={{width:'80%', marginTop:'20px'}}/>
          </Grid>
        </Grid>
        }
        </>
    )
  
}