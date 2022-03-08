import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import EditGuildProfileForm from '../EditProfile/editGuild'

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
import { Button } from '@mui/material'

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
    centered: {
        position: 'fixed',
        top: '40%',
        left: '40%',
      },
    noProfile: {
        position: 'fixed',
        top: '40%',
        left: 'calc(50% - 105px)',
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

export default function UnregisteredProfile(props) {

    const [individual, setIndividual] = useState(false)
    const [guild, setGuild] = useState(false)

    const [open, setOpen] = useState(true)
    const [avatar, setAvatar] = useState(imageName)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [finished, setFinished] = useState(false)
    const [twitter, setTwitter] = useState('')
    const [reddit, setReddit] = useState('')
    const [discord, setDiscord] = useState('')
    const [birthdate, setBirthdate] = useState('')
    const [country, setCountry] = useState('')
    const [language, setLanguage] = useState([])
    const [skill, setSkill] = useState([])
    const [familiarity, setFamiliarity] = useState('')
    const [skillSet, setSkillSet] = useState({})
    const [developerSkillSet, setDeveloperSkillSet] = useState({})
    const [personaSkillSet, setPersonaSkillSet] = useState([])
    const [personaSpecificSkillSet, setPersonaSpecificSkillSet] = useState([])

    const [purpose, setPurpose] = useState('')
    const [date, setDate] = useState('')
    const [logo, setLogo] = useState(logoName)
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
    const [contractId, setContractId] = useState('')
    const [summoner, setSummoner] = useState('')
    const [updated, setUpdated] = useState('')

    const [guildProfileEdit, setGuildProfileEdit] = useState(false)
    const [editGuildProfileClicked, setEditGuildProfileClicked] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      isUpdated,
      curUserIdx,
      appIdx,
      near,
      did,
      accountId,
      verificationStatus,
      accountType
    } = state

    const {
      member
    }= props

    useEffect(
      () => {
          async function fetchMemberData() {
            
             
          }
          
          fetchMemberData()
          .then((res) => {

          })

      }, []
  )

  useEffect(
    () => {
      guildProfileEdit ? window.location.assign('/'): null
    }, [guildProfileEdit]
    )
   
    useEffect(
        () => {
 
          async function fetchData() {
            if(isUpdated){}
            if(did){
              let result = await appIdx.get('profile', did)
              if(result){
                setIndividual(true)
                result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                result.name ? setName(result.name) : setName('')
                result.email ? setEmail(result.email) : setEmail('')
                result.discord? setDiscord(result.discord) : setDiscord('')
                result.reddit ? setReddit(result.reddit) : setReddit('')
                result.twitter ? setTwitter(result.twitter) : setTwitter('')
                result.country ? setCountry(result.country) : setCountry('')
                result.birthdate ? setBirthdate(result.birthdate) : setBirthdate('')
                result.language ? setLanguage(result.language) : setLanguage([])
                result.skill ? setSkill(result.skill) : setSkill([])
                result.familiarity ? setFamiliarity(result.familiarity): setFamiliarity('')
                result.skillSet ? setSkillSet(result.skillSet) : setSkillSet({})
                result.developerSkillSet ? setDeveloperSkillSet(result.developerSkillSet) : setDeveloperSkillSet({})
                result.personaSkills ? setPersonaSkillSet(result.personaSkills) : setPersonaSkillSet([])
                result.personaSpecificSkills ? setPersonaSpecificSkillSet(result.personaSpecificSkills) : setPersonaSpecificSkillSet([])
              } else {
                let result = await appIdx.get('guildProfile', did)
                if(result) {
                    setGuild(true)
                    result.summoner ? setSummoner(result.summoner) : setSummoner('')
                    result.contractId ? setContractId(result.contractId) : setContractId('')
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
                    result.lastUpdated ? setUpdated(result.lastUpdated) : setUpdated('')
                }
              }
            }
          }

          fetchData()
            .then((res) => {
              setFinished(true)
            })
          
    }, [did, isUpdated]
    )

     const handleEditGuildProfileClick = () => {
    handleExpanded()
    handleEditGuildClickState(true)
    }

    function handleEditGuildClickState(property){
    setEditGuildProfileClicked(property)
    }

    function handleGuildProfileEdit(property){
    setGuildProfileEdit(property)
    }

    function handleExpanded() {
        setAnchorEl(null)
    }

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
     
            {individual ?
              finished ? (<>
              
                <Grid container justifyContent="space-evenly" spacing={1} style={{marginTop:'20px', padding:'10px'}}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                        <Avatar src={avatar} style={{width:'150px', height:'auto', marginBottom:'10px'}}  />
                        <Typography variant="h5">
                            {name ? name : member}
                        </Typography>
                        <Stack direction="row" spacing={1} justifyContent="center">
                            {accountType == 'individual' ? <Chip icon={<AppRegistrationIcon />} label="Registered" /> : <Chip icon={<AppRegistrationIcon />} label=" Not Registered" /> }
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
                            {member ? <TableRow key={member}><TableCell>NEAR Account</TableCell><TableCell component="th" scope="row">{member}</TableCell></TableRow> : null }
                            {accountType == 'individual' ? <TableRow key={'accountType'}><TableCell>Registered</TableCell><TableCell component="th" scope="row">Yes</TableCell></TableRow> : <TableRow key={'accountType'}><TableCell>Registered</TableCell><TableCell component="th" scope="row">No</TableCell></TableRow> }
                            {birthdate ? <TableRow key={birthdate}><TableCell>Birthday</TableCell><TableCell component="th" scope="row">{birthdate}</TableCell></TableRow> : null }
                            {country ? <TableRow key={country}><TableCell>Country</TableCell><TableCell component="th" scope="row">{country}</TableCell></TableRow> : null }
                            {language && language.length > 0 ? <TableRow key='language'><TableCell>Language</TableCell><TableCell component="th" scope="row">{language.map((item, i) => { return (<><Typography key={i} variant="overline">{item},</Typography> </>) })}</TableCell></TableRow>: null } 
                            </TableBody>
                        </Table>
                        </TableContainer>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                        <Accordion>
                            <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            >
                            <Typography variant="body1" color="primary">More</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                            <Grid container spacing={1} justifyContent="center">
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <Typography variant="h6">Values</Typography>
                                <TableContainer component={Paper}>
                                    <Table className={classes.table} size="small" aria-label="a dense table">
                                    <TableHead>
                                    
                                    </TableHead>
                                    <TableBody>
                                    {skillSet ?
                                        Object.entries(skillSet).map(([key, value]) => {
                                            if(value){
                                            return(
                                                <TableRow key={key}>
                                                <TableCell>{key}</TableCell>
                                                </TableRow>
                                            )
                                            }
                                        })
                                        : null
                                    }
                                    {personaSkillSet && personaSkillSet.length > 0 ?
                                        personaSkillSet.map((values, index) => {
                                        
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
                            <Typography variant="h6">Skills & Competencies</Typography>
                            <TableContainer component={Paper}>
                                <Table className={classes.table} size="small" aria-label="a dense table">
                                <TableHead>
                                
                                </TableHead>
                                <TableBody>
                                
                                {developerSkillSet ?
                                    Object.entries(developerSkillSet).map(([key, value]) => {
                                        if(value){
                                        return(
                                            
                                            <TableRow key={key}>
                                            <TableCell>{key}</TableCell>
                                            </TableRow>
                                            
                                        )
                                        }
                                    })
                                    : null
                                }
                                {personaSpecificSkillSet && personaSpecificSkillSet.length > 0 ?
                                
                                    personaSpecificSkillSet.map((values, index) => {
                                        
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
                            <Typography variant="overline">Level of NEAR familiarity: <Rating readOnly value={parseInt(familiarity)} /> </Typography>
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
            : guild ? 
                finished ? (<>
              
                <Grid container justifyContent="space-evenly" spacing={1} style={{marginTop:'20px', padding:'10px'}}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                        <Avatar src={logo} style={{width:'150px', height:'auto', marginBottom:'10px'}}  />
                        <Typography variant="h5">
                            {name ? name : member}
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
                            {summoner ? <TableRow key={summoner}><TableCell>NEAR Account</TableCell><TableCell component="th" scope="row">{summoner}</TableCell></TableRow> : null }
                            {contractId ? <TableRow key={contractId}><TableCell>NEAR Account</TableCell><TableCell component="th" scope="row">{contractId}</TableCell></TableRow> : null }
                            {member ? <TableRow key={member}><TableCell>NEAR Account</TableCell><TableCell component="th" scope="row">{member}</TableCell></TableRow> : null }
                            {accountType == 'guild' ? <TableRow key={'accountType'}><TableCell>Registered</TableCell><TableCell component="th" scope="row">Yes</TableCell></TableRow> : <TableRow key={'accountType'}><TableCell>Registered</TableCell><TableCell component="th" scope="row">No</TableCell></TableRow> }
                            {date ? <TableRow key={date}><TableCell>Founded</TableCell><TableCell component="th" scope="row">{date}</TableCell></TableRow> : null }
                            {updated ? <TableRow key={updated}><TableCell>Updated</TableCell><TableCell component="th" scope="row">{updated}</TableCell></TableRow> : null }
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
                                        <Typography variant="body1">{purpose ? purpose : 'not identified yet'}</Typography>
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
                                    {skills ?
                                        skills.map(({field, item}) => {
                                            return(
                                                <TableRow key={item}>
                                                <TableCell>{field}</TableCell>
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
                                    {specificSkills ?
                                        specificSkills.map(({field, item}) => {
                                            return(
                                                <TableRow key={item}>
                                                <TableCell>{field}</TableCell>
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
                                {website ? <TableRow key={website}><TableCell>Telegram</TableCell><TableCell component="a" href={`https://${website}`} scope="row">{website}</TableCell></TableRow> : null }
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
                    <div className={classes.centered}>
                        <CircularProgress size={100} color="primary"  />
                   </div>
              )
              : (<div className={classes.noProfile}>
                    <Typography variant="h4">No Profile Yet.</Typography>
                    <br></br>
                    <Button className={classes.spacing} variant="contained" color="primary" onClick={handleEditGuildProfileClick}>
                        Create Profile
                    </Button>
 
                </div>
                )}

                {editGuildProfileClicked ? <EditGuildProfileForm
                    handleEditGuildClickState={handleEditGuildClickState}
                    handleGuildProfileEdit={handleGuildProfileEdit}
                    curUserIdx={curUserIdx}
                    did={did}
                    accountId={accountId}
                    /> : null}
        
           
          </div>
          
        )
        
}