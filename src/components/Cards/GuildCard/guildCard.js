import React, { useState, useEffect, useContext } from 'react'
import * as nearAPI from 'near-api-js'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../../state/app'
import { ceramic } from '../../../utils/ceramic'
import EditGuildProfileForm from '../../EditProfile/editGuild'
import GuildProfile from '../../Profiles/guildProfile'
import { catalystDao } from '../../../utils/catalystDao'
import Purpose from '../Purpose/purpose'
import Social from '../../common/Social/social'
import { config } from '../../../state/config'

// Material UI Components
import { makeStyles } from '@mui/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import { red } from '@mui/material/colors'
import Button from '@mui/material/Button'
import { CardHeader, LinearProgress } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import NotInterestedIcon from '@mui/icons-material/NotInterested'
import Chip from '@mui/material/Chip'
import EditIcon from '@mui/icons-material/Edit'
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { SentimentVerySatisfied, SettingsSystemDaydreamOutlined } from '@mui/icons-material'
import { Grid } from '@mui/material'

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      minWidth: '200px',
      maxWidth: '200px',
      verticalAlign: 'middle',
      margin: '10px 10px 10px 10px',
      padding: '2px'
    },
    cardMobile: {
      minWidth: '100%',
      verticalAlign: 'middle',
      margin: '10px 10px 10px 10px',
      padding: '2px'
    },
    square: {
      float: 'left',
      marginRight: '10px',
      marginTop: '5px',
    }
  }));

const imageName = require('../../../img/default_logo.png') // default no-image avatar

export default function GuildCard(props) {

  const { state, dispatch, update } = useContext(appStore);

    const [date, setDate] = useState()
    const [name, setName] = useState('')
    const [logo, setLogo] = useState(imageName)
    const [purpose, setPurpose] = useState('')
    const [category, setCategory] = useState('')
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

    const classes = useStyles();

    const { 
      summoner,
      contractId,
      status,
      makeSearchGuilds,
      did
   } = props
 
   const {
     accountId, 
     appIdx,
     isUpdated,
     near,
     didRegistryContract,
     factoryContract,
     admin
   } = state

    useEffect(
      () => {

      async function fetchData() {
        if(isUpdated){}

        let guildInfo = await appIdx.get('daoProfile', did)
        console.log('guildInfo', guildInfo)
        let thisDaoPlatform
        if(guildInfo.contractId){
          if(guildInfo.contractId.split('.')[1].substr(0,4)=='cdao'){
            thisDaoPlatform = 'Catalyst'
            setDaoPlatform(thisDaoPlatform)
            setDaoPlatformLink(`https://cdao.app/dao/${guildInfo.contractId}`)
          }
          if(guildInfo.contractId.split('.')[1].substr(0,7)=='sputnik'){
            thisDaoPlatform = 'Astro'
            setDaoPlatform(thisDaoPlatform)
            setDaoPlatformLink(`https://app.astrodao.com/dao/${guildInfo.contractId}`)
          }
        }
         
        console.log('contractId', contractId)
        console.log('daoplatform', thisDaoPlatform)
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

           try{
             let verificationStatus = await didRegistryContract.getVerificationStatus({accountId: contractId})
              if(verificationStatus != 'null'){
                setVerified(verificationStatus)
              }
            } catch (err) {
              console.log('error retrieving verification status', err)
            }

           let thisCurDaoIdx
           try{
            let daoAccount = new nearAPI.Account(near.connection, contractId)
            thisCurDaoIdx = await ceramic.getUserIdx(daoAccount, appIdx, near, didRegistryContract)
            setCurDaoIdx(thisCurDaoIdx)
            } catch (err) {
              console.log('problem getting curdaoidx', err)
              return false
            }
          console.log('thiscurdaoidx', thisCurDaoIdx)
           let thisDaoDid = await ceramic.getDid(contractId, factoryContract, didRegistryContract)
           setDaoDid(thisDaoDid)
           let result = await appIdx.get('daoProfile', thisDaoDid)
           console.log('result', result)
           if(result){
                  result.name != '' ? setName(result.name) : setName('')
                  result.date ? setDate(result.date) : setDate('')
                  result.logo !='' ? setLogo(result.logo) : setLogo(imageName)
                  result.purpose != '' ? setPurpose(result.purpose) : setPurpose('')
                  result.category != '' ? setCategory(result.category) : setCategory('')
                  result.owner != '' ? setOwner(result.owner) : setOwner('')
                  result.status = memberStatus
           } else {
             setName('')
             setDate('')
             setLogo(imageName)
             setPurpose('')
             setCategory('')
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

  }, [contractId, isUpdated]
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
  
  function formatDate(timestamp) {
    let stringDate = timestamp.toString()
    let options = {year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)
  }

    return(
        <>
        {!display ? <LinearProgress /> : 
                    
          finished ? 
          (
            <ListItem alignItems="flex-start">
            <ListItemAvatar>
            <Link to={`/profiles/${contractId}`}>
            <div onClick={handleDetailsClick}
            style={{width: '100%', 
                height: '50px',
                backgroundImage: `url(${logo})`, 
                backgroundSize: 'contain',
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            </div>
            </Link>
            </ListItemAvatar>
            <ListItemText
              primary={name != '' ? name : contractId.split('.')[0]}
              secondary={
                <Grid container spacing={1} justifyContent="space-between" alignItems="center">
                  <Grid item xs={3} sm={3} md={3} lg={3} xl={3} >
                    {purpose ? (<Button variant="outlined" style={{textAlign: 'center', fontSize: '80%', marginTop:'5px'}} onClick={handlePurposeClick}>Purpose</Button>) : null}
                  </Grid>
                  <Grid item xs={9} sm={9} md={9} lg={9} xl={9} >
                    <Social did={daoDid} type={'guild'} appIdx={appIdx} platform={daoPlatform}/>
                  </Grid>
                </Grid>
              }
            />
            </ListItem>
          ) 
          : null
        }
       
          {editDaoClicked ? <EditDaoForm
            state={state}
            handleEditDaoClickState={handleEditDaoClickState}
            curDaoIdx={curDaoIdx}
            handleUpdate={handleUpdate}
            contractId={contractId}
            /> : null }
          
           {detailsClicked ? <DaoProfileDisplay
            state={state}
            handleDetailsClickedState={handleDetailsClickedState}
            curDaoIdx={curDaoIdx}
            handleUpdate={handleUpdate}
            contractId={contractId}
            /> : null }

          {purposeClicked ? <Purpose
            handlePurposeClickState={handlePurposeClickState}
            contractId={contractId}
            /> : null }
        </>
       
    )
}