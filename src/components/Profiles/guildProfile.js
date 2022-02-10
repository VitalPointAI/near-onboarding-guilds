import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { ceramic } from '../../utils/ceramic'

// Material UI components
import { makeStyles } from '@mui/styles'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Rating from '@mui/material/Rating'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'
import VerifiedIcon from '@mui/icons-material/Verified'

// CSS Styles

const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth: 800,
      minWidth: 325,
      minHeight: 325,
      
    },
    card: {
      margin: 'auto',
    },
    progress: {
        display: 'flex',
        justifyContent: 'center',
        height: '200px',
        width: '200px',
        alignItems: 'center',
    },
    actionsContainer: {
      marginBottom: '20px',
    },
    large: {
        width: '100px',
        height: 'auto',
        textAlign: 'center',
        marginRight: '15px',
    },
    centered: {
        textAlign: 'center'
    },
    accHeading: {
      fontSize: '18px',
      fontWeight: 'bold',
    },
    heading: {
      fontSize: 18,
      marginLeft: '10px'
    },
    }));

const imageName = require('../../img/default-profile.png') // default no-image avatar
const logoName = require('../../img/default_logo.png') // default logo

export default function GuildProfile(props) {

    const [individual, setIndividual] = useState(false)
    const [guild, setGuild] = useState(false)
    
    const [open, setOpen] = useState(true)
    const [purpose, setPurpose] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [finished, setFinished] = useState(false)
    const [twitter, setTwitter] = useState('')
    const [reddit, setReddit] = useState('')
    const [discord, setDiscord] = useState('')
    const [date, setDate] = useState('')
    const [logo, setLogo] = useState(logoName)
    const [country, setCountry] = useState('')
    const [language, setLanguage] = useState([])
    const [category, setCategory] = useState('')
    const [skills, setSkills] = useState([])
    const [specificSkills, setSpecificSkills] = useState([])
    const [platform, setPlatform] = useState('')
    const [discordActivated, setDiscordActivated] = useState(false)
    const [proposalsActivated, setProposalsActivated] = useState(false)
    const [passedProposalsActivated, setPassedProposalsActivated] = useState(false)
    const [votingActivated, setVotingActivated] = useState(false) 
    const [sponsorActivated, setSponsorActivated] = useState(false) 
    const [website, setWebsite] = useState('')
    const [telegram, setTelegram] = useState('')
    const [skillSet, setSkillSet] = useState({})
    const [developerSkillSet, setDeveloperSkillSet] = useState({})
    const [personaSkillSet, setPersonaSkillSet] = useState([])
    const [personaSpecificSkillSet, setPersonaSpecificSkillSet] = useState([])

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      isUpdated,
      curUserIdx,
      appIdx,
      near,
      did,
      accountId,
      accountType,
      verificationStatus,
      factoryContact,
      didRegistryContract
    } = state

    const {
        guildDid
    }= props

    useEffect(
        () => {
 
        async function fetchData() {
            if(isUpdated){}
            if(guildDid && appIdx){
                let result = await appIdx.get('daoProfile', guildDid)
                console.log('result', result)
                if(result) {
                    setGuild(true)
                    result.purpose ? setPurpose(result.purpose) : setPurpose('')
                    result.name ? setName(result.name) : setName('')
                    result.date ? setDate(result.date) : setDate('')
                    result.logo ? setLogo(result.logo) : setLogo(imageName)
                    result.country ? setCountry(result.country) : setCountry('')
                    result.language ? setLanguage(result.language) : setLanguage([])
                    result.skills ? setSkills(result.skills) : setSkills([])
                    result.specificSkills ? setSpecificSkills(result.specificSkills) : setValue([])
                    result.category ? setCategory(result.category) : setCategory('')
                    result.discordActivation ? setDiscordActivated(true) : setDiscordActivated(false)
                    result.proposalActivation ? setProposalsActivated(true) : setProposalsActivated(false)
                    result.passedProposalActivation ? setPassedProposalsActivated(true) : setPassedProposalsActivated(false)
                    result.sponsorActivation ? setSponsorActivated(true) : setSponsorActivated(false)
                    result.reddit? setReddit(result.reddit) : setReddit('')
                    result.discord? setDiscord(result.discord): setDiscord('')
                    result.twitter? setTwitter(result.twitter): setTwitter('')
                    result.email? setEmail(result.email): setEmail('')
                    result.telegram? setTelegram(result.telegram): setTelegram('')
                    result.website? setWebsite(result.website): setWebsite('')
                    result.platform ? setPlatform(result.platform) : setPlatform('')
                }
            } else {
                if(did && appIdx){
                    let result = await appIdx.get('daoProfile', did)
                    console.log('result', result)
                        if(result) {
                            setGuild(true)
                            result.purpose ? setPurpose(result.purpose) : setPurpose('')
                            result.name ? setName(result.name) : setName('')
                            result.date ? setDate(result.date) : setDate('')
                            result.logo ? setLogo(result.logo) : setLogo(imageName)
                            result.country ? setCountry(result.country) : setCountry('')
                            result.language ? setLanguage(result.language) : setLanguage([])
                            result.skills ? setSkills(result.skills) : setSkills([])
                            result.specificSkills ? setSpecificSkills(result.specificSkills) : setValue([])
                            result.category ? setCategory(result.category) : setCategory('')
                            result.discordActivation ? setDiscordActivated(true) : setDiscordActivated(false)
                            result.proposalActivation ? setProposalsActivated(true) : setProposalsActivated(false)
                            result.passedProposalActivation ? setPassedProposalsActivated(true) : setPassedProposalsActivated(false)
                            result.sponsorActivation ? setSponsorActivated(true) : setSponsorActivated(false)
                            result.reddit? setReddit(result.reddit) : setReddit('')
                            result.discord? setDiscord(result.discord): setDiscord('')
                            result.twitter? setTwitter(result.twitter): setTwitter('')
                            result.email? setEmail(result.email): setEmail('')
                            result.telegram? setTelegram(result.telegram): setTelegram('')
                            result.website? setWebsite(result.website): setWebsite('')
                            result.platform ? setPlatform(result.platform) : setPlatform('')
                        }
                }
            }
        }

          fetchData()
            .then((res) => {
              setFinished(true)
            })
          
    }, [did, appIdx, isUpdated]
    )
console.log('finished', finished)
    const languages = language.map((item, i) => {
      if (i == language.length -1){
        item = item
      } else {
        item = item + ', '
      }
      return (
        <Typography key={i} variant="overline">{item}</Typography>
        ) 
      })

        return (
            <div>
     
            {finished ? (<>
              
                <Grid container justifyContent="space-evenly" spacing={1} style={{marginTop:'20px', padding:'10px'}}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                        <Avatar src={logo} style={{width:'75%', height:'auto', marginBottom:'10px'}}  />
                        <Typography variant="h5">
                            {name ? name : accountId}
                        </Typography>
                        <Stack direction="row" spacing={1} justifyContent="center">
                            {accountType == 'guild' ? <Chip icon={<AppRegistrationIcon />} label="Registered" /> : <Chip icon={<AppRegistrationIcon />} label=" Not Registered" /> }
                            {verificationStatus ? <Chip icon={<VerifiedIcon />} label="Verified" variant="outlined" /> : null }
                        </Stack>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                        <Typography variant="h6">General Information</Typography>
                        <TableContainer component={Paper}>
                        <Table className={classes.table} size="small" aria-label="a dense table">
                            <TableHead>
                            
                            </TableHead>
                            <TableBody>
                            {accountId ? <TableRow key={accountId}><TableCell>NEAR Account</TableCell><TableCell component="th" scope="row">{accountId}</TableCell></TableRow> : null }
                            {date ? <TableRow key={date}><TableCell>Updated</TableCell><TableCell component="th" scope="row">{date}</TableCell></TableRow> : null }
                            {category ? <TableRow key={category}><TableCell>Category</TableCell><TableCell component="th" scope="row">{category}</TableCell></TableRow> : null }
                            {country ? <TableRow key={country}><TableCell>Country</TableCell><TableCell component="th" scope="row">{country}</TableCell></TableRow> : null }
                            {language && language.length > 0 ? <TableRow key='language'><TableCell>Language</TableCell><TableCell component="th" scope="row">{language.map((item, i) => { return (<><Typography key={i} variant="overline">{item},</Typography> </>) })}</TableCell></TableRow>: null }                
                            </TableBody>
                        </Table>
                        </TableContainer>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Accordion>
                            <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            >
                                <Typography variant="h5" color="primary">Purpose</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={1} justifyContent="center">
                                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                        <Typography variant="body1">{purpose ? <div dangerouslySetInnerHTML={{ __html: purpose}} /> : 'not identified yet'}</Typography>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                        <Accordion>
                            <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            >
                            <Typography variant="body1" color="primary">More Info</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                            <Grid container spacing={1} justifyContent="center">
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <Typography variant="h6">Guild Values</Typography>
                                <TableContainer component={Paper}>
                                    <Table className={classes.table} size="small" aria-label="a dense table">
                                    <TableHead>
                                    
                                    </TableHead>
                                    <TableBody>
                                    {skills && skills.length > 0 ?
                                        skills.map((values, index) => {
                                        
                                            return (
                                            <TableRow key={values.name}>
                                                <TableCell>{values.name}</TableCell>
                                            </TableRow>
                                            )
                                        
                                    })
                                    : null
                                    }
                                    </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <Typography variant="h6">Desired Skills</Typography>
                                <TableContainer component={Paper}>
                                    <Table className={classes.table} size="small" aria-label="a dense table">
                                    <TableHead>
                                    
                                    </TableHead>
                                    <TableBody>
                                    {specificSkills && specificSkills.length > 0 ?
                                        specificSkills.map((values, index) => {
                                        
                                            return (
                                            <TableRow key={values.name}>
                                                <TableCell>{values.name}</TableCell>
                                            </TableRow>
                                            )
                                        
                                    })
                                    : null
                                    }
                                    </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>        
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <Typography variant="h6">Contacts and Connections</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <TableContainer component={Paper}>
                                <Table className={classes.table} size="small" aria-label="a dense table">
                                <TableHead>
                                
                                </TableHead>
                                <TableBody>
                                {email ? <TableRow key={email}><TableCell>Email</TableCell><TableCell component="a" href={`mailto:${email}`} scope="row">{email}</TableCell></TableRow> : null }
                                {discord ? <TableRow key={discord}><TableCell>Discord</TableCell><TableCell component="th" scope="row">{discord}</TableCell></TableRow> : null }
                                {twitter ? <TableRow key={twitter}><TableCell>Twitter</TableCell><TableCell component="a" href={`https://twitter.com/${twitter}`} scope="row">{twitter}</TableCell></TableRow> : null }
                                {reddit ? <TableRow key={reddit}><TableCell>Reddit</TableCell><TableCell component="a" href={`https://reddit.com/user/${reddit}`} scope="row">{reddit}</TableCell></TableRow> : null }
                                {telegram ? <TableRow key={telegram}><TableCell>Telegram</TableCell><TableCell component="a" href={`https://t.me/${telegram}`} scope="row">{telegram}</TableCell></TableRow> : null }
                                {website ? <TableRow key={website}><TableCell>Website</TableCell><TableCell component="a" href={`https://${website}`} scope="row">{website}</TableCell></TableRow> : null }
                                {platform ? <TableRow key={platform}><TableCell>DAO</TableCell><TableCell component="a" href={`https://${platform}`} scope="row">{platform}</TableCell></TableRow> : null }
                                </TableBody>
                                </Table>
                            </TableContainer>
                            </Grid>
                            </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
              </Grid>
              </>)
              : (
                    <div className={classes.progress}>
                        <CircularProgress size={100} color="primary"  />
                   </div>
              )
            }
           
          </div>
        )
}