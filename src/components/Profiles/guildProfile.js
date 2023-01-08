import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import Social from '../common/Social/social'

// Material UI components
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
import MailIcon from '@mui/icons-material/Mail'
import { Button, LinearProgress, Divider } from '@mui/material'
import Box from '@mui/material/Box'

const logoName = require('../../img/default_logo.png') // default logo

export default function GuildProfile(props) {

    const [individual, setIndividual] = useState(false)
    const [guild, setGuild] = useState(false)
    
    const [contractId, setContractId] = useState('')
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
    const [values, setValues] = useState([])
    const [teach, setTeach] = useState([])
    const [focus, setFocus] = useState([])
    const [projects, setProjects] = useState([])
    const [services, setServices] = useState([])
    const [platform, setPlatform] = useState('')
    const [personaValidators, setPersonaValidators] = useState([])
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
    const [summoner, setSummoner] = useState('')
    const [updated, setUpdated] = useState('')
    const [pfpLogo, setPfpLogo] = useState(logoName)
    const [nftContract, setNftContract] = useState('')
    const [nftTokenId, setNftTokenId] = useState('')

    

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
      registryContract
    } = state

    const {
        guildDid,
        registered
    }= props

    useEffect(
        () => {
 
        async function fetchData() {
            if(isUpdated){}
            if(guildDid && appIdx){
                let result = await appIdx.get('guildProfile', guildDid)
               
                if(result) {
                    setGuild(true)
                    result.summoner ? setSummoner(result.summoner) : setSummoner('')
                    result.contractId ? setContractId(result.contractId) : setContractId('')
                    result.purpose ? setPurpose(result.purpose) : setPurpose('')
                    result.name ? setName(result.name) : setName('')
                    result.date ? setDate(result.date) : setDate('')
                    result.logo ? setLogo(result.logo) : setLogo(logoName)
                    result.country ? setCountry(result.country) : setCountry('')
                    result.language ? setLanguage(result.language) : setLanguage([])
                    result.skills ? setSkills(result.skills) : setSkills([])
                    result.specificSkills ? setSpecificSkills(result.specificSkills) : setSpecificSkills([])
                    result.teach ? setTeach(result.teach) : setTeach([])
                    result.focus ? setFocus(result.focus) : setFocus([])
                    result.projects ? setProjects(result.projects) : setProjects([])
                    result.values ? setValues(result.values) : setValues([])
                    result.services ? setServices(result.services) : setServices([])
                    result.category ? setCategory(result.category) : setCategory('')
                    result.discordActivation ? setDiscordActivated(true) : setDiscordActivated(false)
                    result.proposalActivation ? setProposalsActivated(true) : setProposalsActivated(false)
                    result.passedProposalActivation ? setPassedProposalsActivated(true) : setPassedProposalsActivated(false)
                    result.validators ? setPersonaValidators(result.validators) : setPersonaValidators([])
                    result.sponsorActivation ? setSponsorActivated(true) : setSponsorActivated(false)
                    result.reddit? setReddit(result.reddit) : setReddit('')
                    result.discord? setDiscord(result.discord): setDiscord('')
                    result.twitter? setTwitter(result.twitter): setTwitter('')
                    result.email? setEmail(result.email): setEmail('')
                    result.telegram? setTelegram(result.telegram): setTelegram('')
                    result.website? setWebsite(result.website): setWebsite('')
                    result.platform ? setPlatform(result.platform) : setPlatform('')
                    result.lastUpdated ? setUpdated(result.lastUpdated) : setUpdated('')
                    result.nftContract ? setNftContract(result.nftContract) : setNftContract('')
                    result.nftTokenId ? setNftTokenId(result.nftTokenId) : setNftTokenId('')
                    result.profileNft ? setPfpLogo(result.profileNft) : setPfpLogo(logoName)
                }
            } else {
                if(did && appIdx){
                    let result = await appIdx.get('guildProfile', did)
                
                        if(result) {
                            setGuild(true)
                            result.summoner ? setSummoner(result.summoner) : setSummoner('')
                            result.contractId ? setContractId(result.contractId) : setContractId('')
                            result.purpose ? setPurpose(result.purpose) : setPurpose('')
                            result.name ? setName(result.name) : setName('')
                            result.date ? setDate(result.date) : setDate('')
                            result.logo ? setLogo(result.logo) : setLogo(logoName)
                            result.country ? setCountry(result.country) : setCountry('')
                            result.language ? setLanguage(result.language) : setLanguage([])
                            result.skills ? setSkills(result.skills) : setSkills([])
                            result.specificSkills ? setSpecificSkills(result.specificSkills) : setSpecificSkills([])
                            result.teach ? setTeach(result.teach) : setTeach([])
                            result.focus ? setFocus(result.focus) : setFocus([])
                            result.projects ? setProjects(result.projects) : setProjects([])
                            result.values ? setValues(result.values) : setValues([])
                            result.services ? setServices(result.services) : setServices([])
                            result.category ? setCategory(result.category) : setCategory('')
                            result.discordActivation ? setDiscordActivated(true) : setDiscordActivated(false)
                            result.proposalActivation ? setProposalsActivated(true) : setProposalsActivated(false)
                            result.validators ? setPersonaValidators(result.validators) : setPersonaValidators([])
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
                            result.nftContract ? setNftContract(result.nftContract) : setNftContract('')
                            result.nftTokenId ? setNftTokenId(result.nftTokenId) : setNftTokenId('')
                            result.profileNft ? setPfpLogo(result.profileNft) : setPfpLogo(logoName)
                        }
                }
            }
        }

          fetchData()
            .then((res) => {
              setFinished(true)
            })
          
    }, [did, guildDid, appIdx, isUpdated]
    )

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
                        <div style={{width: '100%', 
                            height: '100px',
                            backgroundImage: `url(${pfpLogo != logoName && pfpLogo != '' ? pfpLogo : logo})`, 
                            backgroundSize: 'contain',
                            backgroundPosition: 'center', 
                            backgroundRepeat: 'no-repeat',
                            backgroundOrigin: 'content-box'
                        }}></div>
                        <Typography variant="h5">
                            {name ? name : accountId}
                        </Typography>
                        <Stack direction="row" spacing={1} justifyContent="center">
                            {accountType == 'guild' || registered ? <Chip icon={<AppRegistrationIcon />} label="Registered" /> : <Chip icon={<AppRegistrationIcon />} label=" Not Registered" /> }
                            {verificationStatus ? <Chip icon={<VerifiedIcon />} label="Verified" variant="outlined" /> : null }
                        </Stack>
                        <Divider variant="middle" style={{marginTop: '15px', marginBottom:'15px'}}/>
                            <Social did={guildDid ? guildDid : did} type={accountType} appIdx={appIdx} platform={platform} summoner={summoner} style={{paddingLeft: '15px', paddingRight:'15px'}}/>
                        <Divider variant="middle" style={{marginTop: '15px', marginBottom:'15px'}}/>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                        <Typography variant="h6">General Information</Typography>
                        <TableContainer component={Paper}>
                        <Table size="small" aria-label="a dense table">
                            <TableHead>
                            
                            </TableHead>
                            <TableBody>
                            {summoner ? <TableRow key={summoner}><TableCell>NEAR Account</TableCell><TableCell component="th" scope="row">{summoner}</TableCell></TableRow> : null }
                            {date ? <TableRow key={'5'}><TableCell>Founded</TableCell><TableCell component="th" scope="row">{date}</TableCell></TableRow> : null }
                            {updated ? <TableRow key={updated}><TableCell>Updated</TableCell><TableCell component="th" scope="row">{updated}</TableCell></TableRow> : null }
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
                                    <Table size="small" aria-label="a dense table">
                                    <TableHead>
                                    
                                    </TableHead>
                                    <TableBody>
                                    {values && values.length > 0 ?
                                        values.map((values, index) => {
                                        
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
                                <Typography variant="h6">Desired General Skills</Typography>
                                <TableContainer component={Paper}>
                                    <Table size="small" aria-label="a dense table">
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
                                <Typography variant="h6">Desired Specific Skills</Typography>
                                <TableContainer component={Paper}>
                                    <Table size="small" aria-label="a dense table">
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
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <Typography variant="h6">Focus Areas</Typography>
                                <TableContainer component={Paper}>
                                    <Table size="small" aria-label="a dense table">
                                    <TableHead>
                                    
                                    </TableHead>
                                    <TableBody>
                                    {focus && focus.length > 0 ?
                                        focus.map((values, index) => {
                                        
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
                                <Typography variant="h6">Subjects Taught</Typography>
                                <TableContainer component={Paper}>
                                    <Table size="small" aria-label="a dense table">
                                    <TableHead>
                                    
                                    </TableHead>
                                    <TableBody>
                                    {teach && teach.length > 0 ?
                                        teach.map((values, index) => {
                                        
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
                                <Typography variant="h6">Current Projects</Typography>
                                <TableContainer component={Paper}>
                                    <Table size="small" aria-label="a dense table">
                                    <TableHead>
                                    
                                    </TableHead>
                                    <TableBody>
                                    {projects && projects.length > 0 ?
                                        projects.map((values, index) => {
                                        
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
                                <Typography variant="h6">Services Offered</Typography>
                                <TableContainer component={Paper}>
                                    <Table size="small" aria-label="a dense table">
                                    <TableHead>
                                    
                                    </TableHead>
                                    <TableBody>
                                    {services && services.length > 0 ?
                                        services.map((values, index) => {
                                        
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
                          </Grid>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            >
                            <Typography variant="body1" color="primary">Staking</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                            <Grid container spacing={1} justifyContent="center">
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <Typography variant="h6">Staking Validators</Typography>
                                <TableContainer component={Paper}>
                                    <Table size="small" aria-label="a dense table">
                                    <TableHead>
                                    
                                    </TableHead>
                                    <TableBody>
                                    {personaValidators && personaValidators.length > 0 ?
                                        personaValidators.map((values, index) => {
                                        
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
                            </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
              </Grid>
              </>)
              : (
                    <Box sx={{ display: 'flex',
                    justifyContent: 'center',
                    height: '200px',
                    width: '200px',
                    alignItems: 'center'}}>
                        <CircularProgress size={100} color="primary"  />
                   </Box>
              )
            }
           
          </div>
        )
}