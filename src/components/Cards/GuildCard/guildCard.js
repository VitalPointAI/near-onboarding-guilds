import React, { useState, useEffect, useContext } from 'react'
import * as nearAPI from 'near-api-js'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../../state/app'
import { ceramic } from '../../../utils/ceramic'
import { catalystDao } from '../../../utils/catalystDao'
import Purpose from '../Purpose/purpose'
import Social from '../../common/Social/social'
import { signalCounter, guildRootName } from '../../../state/user'
import { updateCurrentGuilds } from '../../../state/user'


// Material UI Components
import Button from '@mui/material/Button'
import { LinearProgress, CircularProgress } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import NotInterestedIcon from '@mui/icons-material/NotInterested'
import { Grid } from '@mui/material'
import { Typography } from '@mui/material'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import { Stack } from '@mui/material'
import { Badge, Chip } from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import GppMaybeIcon from '@mui/icons-material/GppMaybe'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'
import Tooltip from '@mui/material/Tooltip'
import CategoryIcon from '@mui/icons-material/Category'


const imageName = require('../../../img/default_logo.png') // default no-image avatar
const sortDown = require('../../../img/sortdown.png')
const sortUp = require('../../../img/sortup.png')
const heart = require('../../../img/heart.png')
const brokenHeart = require('../../../img/broken-heart.png')

export default function GuildCard(props) {

  const { state, dispatch, update } = useContext(appStore);

    const [date, setDate] = useState()
    const [name, setName] = useState('')
    const [logo, setLogo] = useState(imageName)
    const [purpose, setPurpose] = useState('')
    const [owner, setOwner] = useState('')
    const [editDaoClicked, setEditDaoClicked] = useState(false)
    const [purposeClicked, setPurposeClicked] = useState(false)
    const [claimed, setClaimed] = useState(false)
    const [display, setDisplay] = useState(true)
    const [anchorEl, setAnchorEl] = useState(null)
    const [anchorE2, setAnchorE2] = useState(null)
    const [finished, setFinished] = useState(false)
    const [created, setCreated] = useState()
    const [detailsClicked, setDetailsClicked] = useState(false) 
    const [memberStatus, setMemberStatus] = useState() 
    const [memberIcon, setMemberIcon] = useState(<NotInterestedIcon />)
    const [verified, setVerified] = useState(false)
    const [daoPlatform, setDaoPlatform] = useState('')
    const [daoPlatformLink, setDaoPlatformLink] = useState('')
    const [changeFinished, setChangeFinished] = useState(true)
    const [tier, setTier] = useState('0')
    const [skills, setSkills] = useState([])
    const [specificSkills, setSpecificSkills] = useState([])
    const [values, setValues] = useState([])
    const [teach, setTeach] = useState([])
    const [focus, setFocus] = useState([])
    const [projects, setProjects] = useState([])
    const [services, setServices] = useState([])
    const [signalFinished, setSignalFinished] = useState(true)

    const [valuePercentMatch, setValuePercentMatch] = useState(0)
    const [subjectMatch, setSubjectMatch] = useState(false)
    const [generalSkillsPercentMatch, setGeneralSkillsPercentMatch] = useState(0)
    const [specificSkillsPercentMatch, setSpecificSkillsPercentMatch] = useState(0)
    const [workPercentMatch, setWorkPercentMatch] = useState(0)
    const [overallMatch, setOverallMatch] = useState(0)

    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])


    const { 
      summoner,
      contractId,
      status,
      makeSearchGuilds,
      guildDid,
      category
   } = props
 
   const {
     accountId, 
     appIdx,
     isUpdated,
     near,
     registryContract,
     factoryContract,
     admins,
   
     isAdmin
   } = state

   const {
    isVerifier
   } = state.user

    useEffect(
      () => {
      
      async function fetchData() {
        if(isUpdated){await updateCurrentGuilds()}

        let guildInfo = await appIdx.get('guildProfile', guildDid)
      
        let thisDaoPlatform
        if(guildInfo && guildInfo.contractId){
          if(guildInfo.contractId.split('.')[1].substr(0,4)=='cdao'){
            thisDaoPlatform = 'Catalyst'
            setDaoPlatform(thisDaoPlatform)
            setDaoPlatformLink(`https://cdao.app/dao/${guildInfo.contractId}`)
          }
          if(guildInfo && guildInfo.contractId.split('.')[1].substr(0,7)=='sputnik'){
            thisDaoPlatform = 'Astro'
            setDaoPlatform(thisDaoPlatform)
            setDaoPlatformLink(`https://app.astrodao.com/dao/${guildInfo.contractId}`)
          }
        }
         
        // Get Member Status if using Catalyst
        if(contractId && thisDaoPlatform=='Catalyst'){
          let thisMemberStatus
          try{
            let contract = await catalystDao.initDaoContract(state.wallet.account(), contractId)
            thisMemberStatus = await contract.getMemberStatus({member: accountId})
            setMemberStatus(thisMemberStatus)
            memberStatus ? setMemberIcon(<CheckCircleIcon />) : setMemberIcon(<NotInterestedIcon />)
          } catch (err) {
              console.log('error retrieving member status', err)
          }
        }

        // Get Verification Status
        if(registryContract){
          try{
            let verificationStatus = await registryContract.getVerificationStatus({accountId: contractId})
         
            if(verificationStatus != 'null'){
              setVerified(verificationStatus)
            }
          } catch (err) {
            console.log('error retrieving verification status', err)
          }
        }

        // Get Tier
        if(registryContract){
          try{
            let tierStatus = await registryContract.getTier({accountId: contractId})
      
            if(tierStatus != 'null'){
              setTier(tierStatus)
            }
          } catch (err) {
            console.log('error retrieving tier')
          }
        }

        // Get relevant profile info
        if(guildInfo){
              guildInfo.name != '' ? setName(guildInfo.name) : setName('')
              guildInfo.date ? setDate(guildInfo.date) : setDate('')
              guildInfo.logo !='' ? setLogo(guildInfo.logo) : setLogo(imageName)
              guildInfo.purpose != '' ? setPurpose(guildInfo.purpose) : setPurpose('')
              guildInfo.owner != '' ? setOwner(guildInfo.owner) : setOwner('')
              guildInfo.status = memberStatus
              guildInfo.skills ? setSkills(guildInfo.skills) : setSkills([])
              guildInfo.specificSkills ? setSpecificSkills(guildInfo.specificSkills) : setSpecificSkills([])
              guildInfo.teach ? setTeach(guildInfo.teach) : setTeach([])
              guildInfo.focus ? setFocus(guildInfo.focus) : setFocus([])
              guildInfo.projects ? setProjects(guildInfo.projects) : setProjects([])
              guildInfo.values ? setValues(guildInfo.values) : setValues([])
              guildInfo.services ? setServices(guildInfo.services) : setServices([])
              guildInfo.likes ? setCurrentLikes(guildInfo.likes) : setCurrentLikes([])
              guildInfo.dislikes ? setCurrentDisLikes(guildInfo.dislikes) : setCurrentDisLikes([])
              guildInfo.neutrals ? setCurrentNeutrals(guildInfo.neutrals) : setCurrentNeutrals([])
        } else {
          setName('')
          setDate('')
          setLogo(imageName)
          setPurpose('')
          setOwner('')
        }
        
        
        return true
      }

      let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
            setFinished(true)
            if(makeSearchGuilds){
              makeSearchGuilds(res)
            }
          })
        return () => mounted = false
        }

  }, [contractId, isUpdated]
  )

  useEffect(()=> {
    async function determineMatch(){
      let profile = await appIdx.get('profile', state.did)
     
      if(profile && values){
        let valueMatch = 0

        let valueTotal = profile.values ? profile.values.length : 0
  
        for(let x = 0; x < profile.values.length; x++){
          for(let i = 0; i < values.length; i++){

            if(profile.values[x].name.toLowerCase() == values[i].name.toLowerCase()){
              valueMatch ++
            }
          }
        }
        let thisValuePercentMatch = Math.round((valueMatch/valueTotal * 100))
        setValuePercentMatch(thisValuePercentMatch)

        // Check if guild teaches what user wants to learn
        let thisSubjectMatch = false
        for(let y = 0; y < profile.learningGoals.length; y++){
          for(let z = 0; z < teach.length; z++){
            if(profile.learningGoals[y].name.toLowerCase() == teach[z].name.toLowerCase()){
              thisSubjectMatch = true
            }
          }
        }
        setSubjectMatch(thisSubjectMatch)

        // Check for general skills match
        let generalSkillsMatch = 0
        let generalSkillsTotal = profile.personaSkills.length
        for(let x = 0; x < profile.personaSkills.length; x++){
          for(let i = 0; i < skills.length; i++){
            if(profile.personaSkills[x].name.toLowerCase() == skills[i].name.toLowerCase()){
              generalSkillsMatch ++
            }
          }
        }
        let thisGeneralSkillsPercentMatch = Math.round((generalSkillsMatch/generalSkillsTotal * 100))
        setGeneralSkillsPercentMatch(thisGeneralSkillsPercentMatch)

         // Check for specific skills match
         let specificSkillsMatch = 0
         let specificSkillsTotal = profile.personaSkills.length
         for(let x = 0; x < profile.personaSkills.length; x++){
           for(let i = 0; i < skills.length; i++){
             if(profile.personaSkills[x].name.toLowerCase() == skills[i].name.toLowerCase()){
               specificSkillsMatch ++
             }
           }
         }
         let thisSpecificSkillsPercentMatch = Math.round((specificSkillsMatch/specificSkillsTotal * 100))
         setSpecificSkillsPercentMatch(thisSpecificSkillsPercentMatch)

          // Check for work/services match
          let workMatch = 0
          let workTotal = profile.workDesires.length
          for(let x = 0; x < profile.workDesires.length; x++){
            for(let i = 0; i < services.length; i++){
              if(profile.workDesires[x].name.toLowerCase() == services[i].name.toLowerCase()){
                workMatch ++
              }
            }
          }
          let thisWorkPercentMatch = Math.round((workMatch/workTotal * 100))
          setWorkPercentMatch(thisWorkPercentMatch)

          let overall = Math.round((thisValuePercentMatch + thisGeneralSkillsPercentMatch + thisSpecificSkillsPercentMatch + workMatch) / 4)
          setOverallMatch(overall)
      }

    }

    determineMatch()
    .then((res) => {

    })
  }, [values])

  function handleUpdate(property){
    setIsUpdated(property)
  }

  const handleEditDaoClick = () => {
    handleExpanded()
    handleEditDaoClickState(true)
  }
  const handleDetailsClick= () => {
    handleExpandedDetails()
    handleDetailsClickedState(true)
  }

  function handleDetailsClickedState(property){
    setDetailsClicked(property)
  }

  function handleEditDaoClickState(property){
    setEditDaoClicked(property)
  }

  const handlePurposeClick = () => {
    handleExpanded()
    handlePurposeClickState(true)
  }

  function handlePurposeClickState(property){
    setPurposeClicked(property)
  }

  function handleExpanded() {
    setAnchorEl(null)
  }

  function handleExpandedDetails(){
    setAnchorE2(null)
  }

  async function changeVerify(){
    setChangeFinished(false)
    try{
      await registryContract.changeVerificationStatus(
        {
          accountId: contractId,
          verified: !verified
        }
      )
    } catch (err) {
      console.log('error changing verification status', err)
    }
  }

  async function handleSignal(sig, contractId){
    await signalCounter(sig, contractId, accountId, 'guild', near, appIdx, registryContract, guildDid, factoryContract)
    update('', {isUpdated: !isUpdated})
  }

  async function handleTier(event){
    setChangeFinished(false)
    try{
      await registryContract.changeTier({
        accountId: contractId,
        tier: event.target.value
      })
    } catch (err) {
      console.log('problem changing tier', err)
    }
  }

    return(
        <>
        {!display ? <LinearProgress /> : 
                    
          finished ? 
          (
            <>
            <ListItem alignItems="flex-start" style={{flexWrap:'wrap'}}>
            <Grid container spacing={1} alignItems="center" justifyContent="space-between">
              
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                <Stack direction="row" spacing={1} justifyContent="space-evenly">
                  <Typography variant="overline">V: {valuePercentMatch}%</Typography>
                  <Typography variant="overline">L: {subjectMatch ? 'yes' : 'no'}</Typography>
                  <Typography variant="overline">G: {generalSkillsPercentMatch}%</Typography>
                  <Typography variant="overline">S: {specificSkillsPercentMatch}%</Typography>
                  <Typography variant="overline">W: {workPercentMatch}%</Typography>
                  <Typography variant="h5">{overallMatch}%</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                  
                    <a href={`${guildRootName}/guild-profiles/${guildDid}`}> 
                    <div style={{width: '100%', 
                      height: '100px',
                      backgroundImage: `url(${logo})`, 
                      backgroundSize: 'contain',
                      backgroundPosition: 'center', 
                      backgroundRepeat: 'no-repeat',
                      backgroundOrigin: 'content-box'
                      }}>
                    </div>
                    <Typography variant="h5">{name != '' ? name : contractId.split('.')[0]}</Typography>
                    </a>
                    <Stack direction="row" spacing={1} justifyContent="center" style={{marginTop:'5px'}}>
                    {verified ? 
                      <>
                      <Chip icon={
                          <VerifiedUserIcon />
                      } label="Verified"/>
                      <Chip icon={
                            <MilitaryTechIcon />
                      } label={`Tier ${tier}`}/>
                      </>
                    : <>
                    <Chip icon={
                          <GppMaybeIcon color="secondary"/>
                    } label="Not Verified"/>
                    <Chip icon={
                            <MilitaryTechIcon />
                    } label={`Tier ${tier}`}/>
                    </>
                    }
                   
                      <Badge badgeContent={currentLikes.length} anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }} color="primary" max={9999999}>  
                      {signalFinished ?  
                        <img src={heart} style={{height: '30px'}} onClick={(e) => handleSignal('like', contractId)}/>
                      : <CircularProgress fontSize="small" />
                      }
                      </Badge>
                      
                  </Stack>
                  
                </Grid>                     
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                  <Stack direction="row" spacing={1} justifyContent="space-between">  
                    {purpose ? (<Button variant="outlined" style={{textAlign: 'center', fontSize: '80%', marginTop:'5px'}} onClick={handlePurposeClick}>Purpose</Button>) : null}
                    {category != '' && category != 'undefined' && category ? <Chip icon={<CategoryIcon />} label={category} variant="outlined" style={{marginTop: '5px'}}/> : null}
                  </Stack>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
              <Social did={guildDid} type={'guild'} appIdx={appIdx} platform={daoPlatform} platformLink={daoPlatformLink}/>
              </Grid>
              {(isVerifier || isAdmin) && accountId != contractId ?
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                  <Stack direction="row" spacing={1} justifyContent="space-between" style={{backgroundColor:'#d7d7d757', padding: '5px'}}>
                  {changeFinished ? 
                    <FormControl>
                      <FormLabel id="demo-radio-buttons-group-label">Tier</FormLabel>
                      <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        defaultValue="0"
                        value={tier}
                        onChange={handleTier}
                      >
                        <FormControlLabel value="1" control={<Radio />} label="1" />
                        <FormControlLabel value="2" control={<Radio />} label="2" />
                        <FormControlLabel value="3" control={<Radio />} label="3" />
                        <FormControlLabel value="4" control={<Radio />} label="4" />
                      </RadioGroup>
                    </FormControl>
                    : <LinearProgress />
                  }
                  {changeFinished ? 
                    !verified ? 
                    <Button variant="outlined" style={{textAlign: 'center', marginTop:'20px'}} onClick={changeVerify}>
                      Verify
                    </Button> 
                    : <Button variant="outlined" style={{textAlign: 'center', marginTop:'20px'}} onClick={changeVerify}>
                        Unverify
                      </Button>
                  : <LinearProgress />
                  }
                    </Stack>
                </Grid>
              : null }          
            </Grid>
            <Divider variant="middle" style={{marginTop: '15px', width:'100%', marginBottom: '15px'}}/>
            </ListItem>
            </>
            ) 
          : null
        }
       

          {purposeClicked ? <Purpose
            handlePurposeClickState={handlePurposeClickState}
            contractId={contractId}
            /> : null }
        </>
       
    )
}