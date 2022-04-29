import React, { useState, useEffect, useContext } from 'react'
import * as nearAPI from 'near-api-js'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../../state/app'
import { ceramic } from '../../../utils/ceramic'
import { catalystDao } from '../../../utils/catalystDao'
import Purpose from '../Purpose/purpose'
import Social from '../../common/Social/social'
import { signal } from '../../../state/near'


// Material UI Components

import Button from '@mui/material/Button'
import { LinearProgress } from '@mui/material'
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
    const [curDaoIdx, setCurDaoIdx] = useState()
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
    const [daoDid, setDaoDid] = useState('')
    const [changeFinished, setChangeFinished] = useState(true)
    const [tier, setTier] = useState('0')

    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])


    const { 
      summoner,
      contractId,
      status,
      makeSearchGuilds,
      did,
      category
   } = props
 
   const {
     accountId, 
     appIdx,
     isUpdated,
     near,
     didRegistryContract,
     factoryContract,
     admins,
     isVerifier,
     isAdmin
   } = state

    useEffect(
      () => {
      
      async function fetchData() {
        if(isUpdated){}

        let guildInfo = await appIdx.get('guildProfile', did)
        console.log('guildInfo', guildInfo)
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
        if(didRegistryContract){
          try{
            let verificationStatus = await didRegistryContract.getVerificationStatus({accountId: contractId})
            console.log('verification status', verificationStatus)
            if(verificationStatus != 'null'){
              setVerified(verificationStatus)
            }
          } catch (err) {
            console.log('error retrieving verification status', err)
          }
        }

        // Get Tier
        if(didRegistryContract){
          try{
            let tierStatus = await didRegistryContract.getTier({accountId: contractId})
            console.log('tierstatus', tierStatus)
            if(tierStatus != 'null'){
              setTier(tierStatus)
            }
          } catch (err) {
            console.log('error retrieving tier')
          }
        }

        // Get relevant profile info after finding DID
        if(near){
          let thisCurDaoIdx
          try{
            let daoAccount = new nearAPI.Account(near.connection, contractId)
            thisCurDaoIdx = await ceramic.getUserIdx(daoAccount, appIdx, factoryContract, didRegistryContract)
            setCurDaoIdx(thisCurDaoIdx)
          } catch (err) {
            console.log('problem getting curdaoidx', err)
            return false
          }
          console.log('thiscurdaoidx', thisCurDaoIdx)

          let thisGuildDid = await ceramic.getDid(contractId, factoryContract, didRegistryContract)
          setDaoDid(thisGuildDid)
          let result = await appIdx.get('guildProfile', thisGuildDid)
          console.log('result', result)
          if(result){
                result.name != '' ? setName(result.name) : setName('')
                result.date ? setDate(result.date) : setDate('')
                result.logo !='' ? setLogo(result.logo) : setLogo(imageName)
                result.purpose != '' ? setPurpose(result.purpose) : setPurpose('')
                result.owner != '' ? setOwner(result.owner) : setOwner('')
                result.status = memberStatus
                result.likes ? setCurrentLikes(result.likes) : setCurrentLikes([])
                result.dislikes ? setCurrentDisLikes(result.dislikes) : setCurrentDisLikes([])
                result.neutrals ? setCurrentNeutrals(result.neutrals) : setCurrentNeutrals([])
          } else {
            setName('')
            setDate('')
            setLogo(imageName)
            setPurpose('')
            setOwner('')
          }
        }
        
        return true
      }

      let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
            setFinished(true)
            makeSearchGuilds(res)
          })
        return () => mounted = false
        }

  }, [contractId, near, isUpdated]
  )

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
      await didRegistryContract.changeVerificationStatus(
        {
          accountId: contractId,
          verified: !verified
        }
      )
    } catch (err) {
      console.log('error changing verification status', err)
    }
  }

  async function handleSignal(sig){
    await signal(sig, curDaoIdx, accountId, 'guild')
    update('', {isUpdated: !isUpdated})
  }
  
  function formatDate(timestamp) {
    let stringDate = timestamp.toString()
    let options = {year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
  }

  async function handleTier(event){
    setChangeFinished(false)
    try{
      await didRegistryContract.changeTier({
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
            <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Stack direction="column" spacing={1}>
                <Badge badgeContent={currentLikes.length} anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }} color="primary" max={9999999}>  
                  <img src={sortUp} style={{width: '50px'}} onClick={(e) => handleSignal('like')}/>
                </Badge>
                <Badge badgeContent={currentDisLikes.length} anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }} color="primary" max={9999999}>  
                  <img src={sortDown} style={{width: '50px'}} onClick={(e) => handleSignal('dislike')}/>
                </Badge>
              </Stack>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Grid container spacing={1} alignItems="center" justifyContent="space-between">
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Link to={`/guild-profiles/${daoDid}`}>  
                    <div style={{width: 'auto', 
                        height: '75px',
                        backgroundImage: `url(${logo})`, 
                        backgroundSize: 'contain',
                        backgroundPosition: 'center', 
                        backgroundRepeat: 'no-repeat',
                        backgroundOrigin: 'content-box'
                    }}>
                    {verified ? 
                      <Stack spacing={1} style={{float: 'right'}}>
                        <Tooltip title="Verified">
                          <VerifiedUserIcon  fontSize="large"/>
                        </Tooltip>
                        <Badge badgeContent={tier}>
                          <Tooltip title="Tier">
                            <MilitaryTechIcon fontSize="large"/>
                          </Tooltip>
                        </Badge>
                      </Stack>
                    :  <Stack spacing={1} style={{float: 'right'}}>
                        <Tooltip title="Not Verified">
                          <GppMaybeIcon color="secondary" fontSize="large"/>
                        </Tooltip>
                        <Badge badgeContent={tier}>
                          <Tooltip title="Tier">
                            <MilitaryTechIcon fontSize="large"/>
                          </Tooltip>
                        </Badge>
                        </Stack>
                    }
                    </div>
                    </Link>
                  </Grid>
                </Grid>
                }
              secondary={
                <Grid container spacing={1} justifyContent="space-between" alignItems="center">
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography variant="h5">{name != '' ? name : contractId.split('.')[0]}</Typography>
                  </Grid>  
                </Grid>
              }
            />
            </ListItem>
            <Grid container spacing={1} justifyContent="space-between" alignItems="center" style={{paddingLeft: '10px', paddingRight:'10px'}}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <Stack direction="row" spacing={1}>  
                  {purpose ? (<Button variant="outlined" style={{textAlign: 'center', fontSize: '80%', marginTop:'5px'}} onClick={handlePurposeClick}>Purpose</Button>) : null}
                  {category != '' ? <Chip icon={<CategoryIcon />} label={category} variant="outlined" style={{marginTop: '5px'}}/> : <Chip icon={<CategoryIcon />} label="undefined" variant="outlined" style={{marginTop:'5px'}}/>}
                  <Social did={daoDid} type={'guild'} appIdx={appIdx} platform={daoPlatform} platformLink={daoPlatformLink}/>
                </Stack>
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
            <Divider variant="middle" style={{marginTop: '15px', marginBottom: '15px'}}/>
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