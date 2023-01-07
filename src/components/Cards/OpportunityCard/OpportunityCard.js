import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { appStore, onAppMount } from '../../../state/app'
import { useParams } from 'react-router-dom'
import { get, set, del } from '../../../utils/storage'
import {OPPORTUNITY_NOTIFICATION, PROPOSAL_NOTIFICATION} from '../../../state/user' 
import { catalystDao } from '../../../utils/catalystDao'
import { getStatus, daoRootName } from '../../../state/user'
import { parseNearAmount, formatNearAmount } from 'near-api-js/lib/utils/format'

// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { green, red } from '@material-ui/core/colors'
import DoneIcon from '@material-ui/icons/Done'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import BlockIcon from '@material-ui/icons/Block'
import LinearProgress from '@material-ui/core/LinearProgress'
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
    pos: {
        marginTop: 0,
    },
    card: {
      maxWidth: '250px',
      margin: '10px 10px 10px 10px'
    },
    logoImage: {
      width: 'fit-content',
      height: '60px'
    },
    avatar: {
      backgroundColor: red[500],
    },
    header: {
      display: 'inherit'
    }
  }));

  function LinearProgressWithLabel(props) {
    return (<>
      <Typography variant="overline" align="center">Suitability Score</Typography>  
      <Tooltip TransitionComponent={Zoom} title="The higher the score, the more skills you have that match the opportunity requirements.">
        <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
      </Tooltip>
     
      <Box alignItems="center">
        <Box maxWidth={75}>
          <Typography variant="body2" color="textSecondary">
          {`${props.value} % `}
            {
              props.value >= 75 ? (
                <Tooltip TransitionComponent={Zoom} title="Go for it!">
                  <DoneIcon fontSize="small" style={{marginRight:'10px', marginTop:'-3px'}} />
                </Tooltip>
              )
              : props.value > 50 && props.value <= 74 ? (
                <Tooltip TransitionComponent={Zoom} title="Doable with some learning.">
                  <HelpOutlineIcon fontSize="small" style={{marginRight:'10px', marginTop:'-3px'}} />
                </Tooltip>
              )
              : props.value <= 50 ? (
                <Tooltip TransitionComponent={Zoom} title="Not Recommended.">
                  <BlockIcon fontSize="small" style={{marginRight:'10px', marginTop:'-3px'}} />
                </Tooltip>
              )
              : (
                <Tooltip TransitionComponent={Zoom} title="Not Recommended.">
                  <BlockIcon fontSize="small" style={{marginRight:'10px', marginTop:'-3px'}} />
                </Tooltip>
              )
            }
            </Typography>
        </Box>
      </Box>
      <Box display="flex" alignItems="center">
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">0</Typography>
        </Box>
        <Box width="100%" mr={1}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">100</Typography>
        </Box>
      </Box>
      </>
    )
  }

  LinearProgressWithLabel.propTypes = {
    /**
     * The value of the progress indicator for the determinate and buffer variants.
     * Value between 0 and 100.
     */
    value: PropTypes.number.isRequired,
  }

  const imageName = require('../../../img/default-profile.png') // default no-image avatar
  const logoName = require('../../../img/default_logo.png') // default no-logo image

export default function OpportunityCard(props) {

    const [applicantName, setApplicantName] = useState('')
    const [applicantAvatar, setApplicantAvatar] = useState(imageName)
    const [pfpApplicantAvatar, setPfpApplicantAvatar] = useState('')
    const [pfpProposerAvatar, setPfpProposerAvatar] = useState('')
    const [applicantLogo, setApplicantLogo] = useState(logoName)

    const [proposerLogo, setProposerLogo] = useState(logoName)
    const [proposerName, setProposerName] = useState('')
    const [proposerAvatar, setProposerAvatar] = useState(imageName)
    const [pfpProposerLogo, setPfpProposerLogo] = useState('')
    const [pfpApplicantLogo, setPfpApplicantLogo] = useState('')

    const [accountType, setAccountType] = useState('')

    const [date, setDate] = useState('')
   
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [reward, setReward] = useState('Calculating...')
    
    const [communityName, setCommunityName] = useState('')
    
  
    const [contract, setContract] = useState()
    const [dateValid, setDateValid] = useState(false)
    const [dateLoaded, setDateLoaded] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [formattedTime, setFormattedTime] = useState('')
    const [days, setDays] = useState(0)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)

    const { state, dispatch, update } = useContext(appStore)
    const [progress, setProgress] = useState(0)

    const {
      registryContract,
      near, 
      appIdx,
      accountId,
      wallet,
      deposit,
      daoFactory,
      isUpdated, 
      nearPrice,
      proposalDeposit
    } = state

    const classes = useStyles();

    const {
      creator,
      created,
      curDaoIdx,
      memberStatus,
      status,
      updated,
      title,
      details,
      projectName,
      category,
      opportunityStatus,
      permission,
      opportunityId,
      skillMatch,
      allSkills,
      suitabilityScore,
      passedContractId,
      deadline,
      budget,
      usd,
      logo,
      name,
      communityDid
    } = props

    useEffect(
      () => {
        let timer

        async function updateNearPrice() {
            try {
              let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
              update('', {nearPrice: getNearPrice.data.near.usd})
            } catch (err) {
              console.log('get near price issue', err)
            }
        }
  
        function stop() {
          if (timer) {
              clearInterval(timer)
              timer = 0
          }
        }

        timer = setInterval(updateNearPrice, 5000)
       
        return () => {
          
          stop()
        }

      }, []
    )

    useEffect(() => {
      async function fetchPrice() {
          if(usd > 0 && nearPrice > 0){
            let near = (usd / nearPrice).toFixed(3)
            let parse = parseNearAmount(near)
            let formatNear = formatNearAmount(parse, 3)
            setReward(formatNear)
          } 
          if(!nearPrice){
            setReward('Calculating ')
          }
          if((!usd || usd == 0) && nearPrice) {
            setReward('0')
          }
      }

      fetchPrice()
      
    }, [usd, nearPrice]
    )


    useEffect(() => {
      if(deadline){
        let timer = setInterval(function() {
          setDateLoaded(false)
          let splitDate = deadline.split("-")
          let countDownDate = new Date(splitDate[0], splitDate[1]-1, splitDate[2]).getTime()
          let now = new Date().getTime()
          let distance = countDownDate - now
          if(distance > 0){
            let thisDays = Math.floor(distance / (1000 * 60 * 60 * 24))
            let thisHours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 *60 * 60))
            let thisMinutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            let thisSeconds = Math.floor((distance % (1000 * 60)) / 1000)
            if(thisDays && thisHours && thisMinutes && thisSeconds){
              setDays(thisDays)
              setHours(thisHours)
              setMinutes(thisMinutes)
              setSeconds(thisSeconds)
              setDateValid(true)
            }
          } else {
            setDays(0)
            setHours(0)
            setMinutes(0)
            setSeconds(0)
            setDateValid(false)
            clearInterval(timer)
          }
          setDateLoaded(true)
        }, 1000)
      } 
    }, [deadline])


    useEffect(
        () => {
          if(isUpdated){}
        async function fetchData() {
         
          let notificationFlag = get(OPPORTUNITY_NOTIFICATION, [])
          if(notificationFlag[0]){
            //open the proposal with the correct id
            if(opportunityId == notificationFlag[0].proposalId){
              del(OPPORTUNITY_NOTIFICATION)
              handleOpportunityProposalDetailsClick()
            }
          }          
        }

        let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
            
          })
        return() => mounted = false
        }
    }, [appIdx, isUpdated]
    )
    

    useEffect(() => {
      if(progress < parseInt(suitabilityScore)){
        const timer = setInterval(() => {
          setProgress((prevProgress) => (prevProgress < parseInt(suitabilityScore) ? prevProgress + 1 : prevProgress))
        }, 25)
        return () => {
          clearInterval(timer)
        }
      }
    }, [])

    useEffect(() => {
      async function fetchContract(){
        if(wallet && passedContractId){
        let thisContract = await catalystDao.initDaoContract(wallet.account(), passedContractId)
        setContract(thisContract)
        }
      }

      fetchContract()
      .then(() => {

      })
    }, [wallet, passedContractId])
    

     // Opportunity Proposal Functions

     const handleEditOpportunityProposalDetailsClick = () => {
      handleExpanded()
      handleEditOpportunityProposalDetailsClickState(true)
    }
  
    function handleEditOpportunityProposalDetailsClickState(property){
      setEditOpportunityProposalDetailsClicked(property)
    }

    const handleOpportunityProposalDetailsClick = () => {
      handleExpanded()
      handleOpportunityProposalDetailsClickState(true)
    }
  
    function handleOpportunityProposalDetailsClickState(property){
      setOpportunityProposalDetailsClicked(property)
    }

    // Member proposal functions

    const handleMemberProfileDisplayClick = () => {
      handleExpanded()
      handleMemberProfileDisplayClickState(true)
    }

    function handleMemberProfileDisplayClickState(property){
      setMemberProfileDisplayClicked(property)
    }
    
    const handleMemberProposalClick = () => {
      handleExpanded()
      handleMemberProposalClickState(true)
    }

    function handleMemberProposalClickState(property) {
      setMemberProposalClicked(property)
    }

    // Funding Proposal Acceptance Functions

    const handleFundingProposalClick = () => {
      handleExpanded()
      setFundingProposalClicked(true)
    }

    function handleFundingProposalClickState(property) {
      setFundingProposalClicked(property)
    }
    
    function handleExpanded() {
      setAnchorEl(null)
    }

    return(
        <>
   
        <Card raised={true} className={classes.card}>

          <Grid container alignItems="center" justifyContent="center" spacing={1} style={{padding: '5px'}}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              { status == 'Passed' && dateValid && budget > 0 && opportunityStatus ?
                <Chip label="Active" style={{marginRight: '10px', backgroundColor: 'green', color:'white'}}/>
              : <Chip label="Inactive" style={{marginRight: '10px', backgroundColor: 'red', color:'white'}}/>
              }
              <div style={{float:'right'}}>
                <Typography variant="subtitle2">
                {dateValid ? 
                  dateLoaded ? 'Expires: ' + days+'d:'+hours+'h:'+minutes+'m:'+seconds
                : 'Calculating...'
                : 'Expired'
                }</Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <Link to={daoRootName + `/dao/${passedContractId}`}>
              <div style={{width: '95%', 
                height: '50px',
                backgroundImage: `url(${logo})`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
              }}/>
              {logo ? null : <Typography variant="h6">{name ? name : passedContractId}</Typography>}
              </Link>
            </Grid>
          </Grid>

          <CardHeader
            title={
              <a href={daoRootName + `/opportunity/${passedContractId}/${communityDid}/${opportunityId}`}>
                <Button 
                  color="primary"
                  style={{fontWeight: '800', fontSize: '110%', lineHeight: '1.1em'}}
                  >{title}
                </Button>
              </a>
            }
          />
          <CardContent>
            <Grid container alignItems="center" style={{marginTop: '-20px', display:'inherit'}}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
              <Typography variant="h6" align="center">Reward</Typography>
              <Typography variant="h6" align="center">{reward} Ⓝ</Typography>
              <Typography variant="subtitle1" color="textSecondary" align="center">~${usd ? usd + ' USD': null}</Typography><br></br>
                <div className={classes.root}>
                  <LinearProgressWithLabel value={progress} />
                </div>
                
                  
              </Grid>
              
            </Grid>
          </CardContent>
          <CardActions>
          {status == 'Passed' ? (
            memberStatus ? (
              dateValid ? (  
                budget > 0 ? (
                  opportunityStatus ? (
                    <a href={daoRootName + `/opportunity/${passedContractId}/${communityDid}/${opportunityId}`}>
                      <Button 
                        color="primary"
                        align="right"
                      >
                          Details
                      </Button>
                    </a>
                  ) : 
                    <>
                    <Button 
                      color="primary" 
                      disabled>
                        Inactive
                    </Button>
                    </>
                ) :
                    <>
                  <Button 
                    color="primary" 
                    disabled>
                      Out of Budget
                  </Button>
                  </>            
              ) :
                <>
                <Button 
                  color="primary" 
                  disabled>
                    Expired
                </Button>
                </>
            ) :
            <a href={`${daoRootName}/dao/${passedContractId}`}>
              <Button 
                color="primary" 
              >
                  Join Project to Accept
              </Button>
            </a>
          ) : null }
           
            
          </CardActions>
        </Card>

          </>
    )
}