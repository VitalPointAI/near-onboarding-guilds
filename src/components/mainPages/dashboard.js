import React, { useEffect, useState, useContext, useRef } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { 
  getStatus,
  MAIL_URL, 
  getSendyAPI, 
  getCommunityMemberStatus,
  getCombinedSkills } from '../../utils/helpers'
import qs from 'qs'
import { ceramic } from '../../utils/ceramic'
import Communities from '../common/Communities/communities'
import CommunityCount from '../common/CommunityCount/communityCount'
import MemberCommunities from '../common/MemberCommunities/memberCommunities'
import MemberCommunityCount from '../common/MemberCommunityCount/memberCommunityCount'
import AccountInfo from '../common/AccountInfo/accountInfo'
import { catalystDao } from '../../utils/catalystDao'
import OpportunityCard from '../Cards/OpportunityCard/OpportunityCard'
import StakingActivity from '../common/StakingActivity/stakingActivity'
import AccountTransactionActivity from '../common/AccountTransactionActivity/accountTransactionActivity'

// Material UI
import useMediaQuery from '@mui/material/useMediaQuery'
import Grid from '@mui/material/Grid'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Chip from '@mui/material/Chip'
import MailIcon from '@mui/icons-material/Mail'
import { LinearProgress } from '@mui/material'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

const axios = require('axios').default

//import './dashboard.css'

const defaultLogo = require('../../img/default_logo.png')

export default function Dashboard(props) {

    const [memberData, setMemberData] = useState()
    const [proposalData, setProposalData] = useState()
    const [contractId, setContractId] = useState('')
    const [memberCommunities, setMemberCommunities] = useState()
   
    const [first, setFirst] = useState(true)
    const [logo, setLogo] = useState(defaultLogo)
    const [value, setValue] = useState('1')
    const [recommendations, setRecommendations] = useState([])
    const [suitabilityScore, setSuitabilityScore] = useState()
    const [recommendationsLoaded, setRecommendationsLoaded] = useState(false)
    const [opportunityProposalDetailsClicked, setOpportunityProposalDetailsClicked] = useState(false)
    const [opportunityId, setOpportunityId] = useState()
    const [proposer, setProposer] = useState()
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [memberDaos, setMemberDaos] = useState([])
    const [guild, setGuild] = useState(false)

    const [email, setEmail] = useState('')
    const [emailNotifications, setEmailNotifications] = useState(false)
    const [emailFinished, setEmailFinished] = useState(true)
    const [finished, setFinished] = useState(false)
    const [oppsLoaded, setOppsLoaded] = useState(false)

    const [anchorEl, setAnchorEl] = useState(null)

    const { state, dispatch, update } = useContext(appStore)
   
    const matches = useMediaQuery('(max-width:500px)')

    let communities = []

    const {
      userInitialized,
      curUserIdx,
      did,
      isVerifier,
      isVerified,
      isAdmin,
      accountType,
      account,
      accountId,
      signedIn,
      balance,
      wallet,
      walletContract, 
      registryContract, 
      factoryContract, 
      nftContract, 
      fundingContract
  } = state.user
  
  const {
      mounted,
      appIdx,
      near,
      appRegistryContract,
      ceramicClient,
      appAccount,
      superAdmin,
      admins,
      announcements,
      isUpdated
  } = state.app
          
  const {
      currentGuilds, 
      currentCommunities, 
      guildsAwaitingVerification,
      currentIndividuals,
      currentVerifiers
  } = state.app
   

    useEffect(
        () => {
            async function fetchMemberData() {
                let memberDaos = []
                let communities = []
              if(currentGuilds && appIdx && account){
                for(let x = 0; x < currentGuilds.length; x++){
                  let guildInfo = await appIdx.get('guildProfile', currentGuilds[x].did)
                  if(guildInfo){
                    let thisMemberStatus = await getCommunityMemberStatus(guildInfo.platform, guildInfo.contractId, account)
                    if(thisMemberStatus){
                      memberDaos.push(currentGuilds[x])
                    }
                  }
                  if(currentGuilds[x].owner == accountId){
                    let name = currentGuilds[x].accountId.split('.')
                    communities.push({contractId: currentGuilds[x].accountId, communityName: name[0]})
                  }
                }
                setMemberDaos(memberDaos)
                setMemberCommunities(communities)
              }
            }
            
            fetchMemberData()
            .then((res) => {
  
            })
  
        }, [currentGuilds, appIdx]
    )

    useEffect(
      () => {
          async function getEmailStatus(){
              if(email){
                  let key = await getSendyAPI()
                  let emailStatus

                  let listId
                  switch(true) {
                    case process.env.ENV == 'test' || process.env.ENV == 'prod':
                      listId = process.env.NG_SENDY_LIST_ID
                    case process.env.ENV == 'localhost':
                      listId = process.env.SENDY_LIST_ID
                  }

                  let data = {
                      api_key: key.data.seed,
                      email: email,
                      list_id: listId
                  }
                  let url = `${MAIL_URL}/api/subscribers/subscription-status.php`
                  try{
                      emailStatus = await axios.post(url,
                          qs.stringify(data),
                          {
                              headers: {
                                  'content-type': 'application/x-www-form-urlencoded'
                              }
                          })
                  
                      if(emailStatus.data == 'Subscribed') {
                          setEmailNotifications(true)
                      }
                      if(emailStatus.data == 'Email does not exist in list' || emailStatus.data == 'Unsubscribed' || emailStatus.data == 'Unconfirmed' || emailStatus.data == 'Bounced'){
                          setEmailNotifications(false)
                      }
                  } catch (err) {
                      console.log('error getting email status', err)
                  }
              }
          }

          getEmailStatus()
          .then((res) => {

          })

      }, [email])

      useEffect(
        () => {
 
        async function fetchData() {
            if(isUpdated){}
            if(did && appIdx){
                let result = await appIdx.get('guildProfile', did)
                
                    if(result) {
                        setGuild(true)
                        result.email? setEmail(result.email): setEmail('')
                    }
            }
            
        }

          fetchData()
            .then((res) => {
              setFinished(true)
            })
          
    }, [did, appIdx, isUpdated]
    )
    
    useEffect(
        () => {          
            if(isUpdated){}  
            async function fetchTab1Data(){
                    setOppsLoaded(false)
                    // Persona Opportunity Recommendations
                  if(appIdx){
                    // 1. Build complete list of all opportuntities for all active DAOs
                    let allOpportunities = []
                    if(currentCommunities && currentCommunities.length > 0){
                      for(let x = 0; x < currentCommunities.length; x++){
                        // let catalystContract
                        // try{
                        //   catalystContract = await dao.initDaoContract(account, currentGuilds[x].contractId)
                        // } catch (err) {
                        //   console.log('problem initializing catalyst dao contract', err)
                        // }
                        let singleDaoOpportunity
                     
                        try{
                          singleDaoOpportunity = await appIdx.get('opportunities', currentCommunities[x].did)
                        
                          if(singleDaoOpportunity && Object.keys(singleDaoOpportunity).length > 0){
                            let j = 0
                            while (j < singleDaoOpportunity.opportunities.length){
                            allOpportunities.push(singleDaoOpportunity.opportunities[j])
                            j++
                            }
                          }
                        } catch (err) {
                          console.log('error loading singledao opportunity', err)
                        }

                      }
                      
                    }
                   
                    // 2. Retrieve current persona data
                    let currentPersona
                  
                    if(accountType != 'guild' && did) {
                      currentPersona = await appIdx.get('profile', did)
                   
                    } else {
                      currentPersona = await appIdx.get('guildProfile', did)
                    }
          

                    // 3. Initialize recommendations array
                    let currentRecommendations = []

                    // 3. For each opportunity, compare opportunity skillset requirements to persona skillsets and add to recommendations array if the same
                    // calculate a suitability percentage from skills required (true) (total skills possessed / total skills)
                    let skillMatch
                    let combinedOpportunitySkills = []

                    // Get complete list of Persona Skills
                    let combinedPersonaSkills = getCombinedSkills(accountType, currentPersona)

                    let j = 0

                    while (j < allOpportunities.length){
                        //reset counters for each iteration through loop

                        skillMatch = 0

                        for (const [key, value] of Object.entries(allOpportunities[j].desiredDeveloperSkillSet)){
                          if(value){
                            combinedOpportunitySkills.push(key)
                          }
                        }
                        for (const [key, value] of Object.entries(allOpportunities[j].desiredSkillSet)){
                          if(value){
                            combinedOpportunitySkills.push(key)
                          }
                        }
                        if (allOpportunities && allOpportunities[j].opportunitySkills.length > 0){
                         allOpportunities[j].opportunitySkills.map((values, index) => {
                            if(values.name){
                              combinedOpportunitySkills.push(values.name)
                            }
                          })
                        }
                       

                        let k = 0
                        while (k < combinedOpportunitySkills.length){
                          let n = 0
                          while (n < combinedPersonaSkills.length){
                            if (combinedPersonaSkills[n] == combinedOpportunitySkills[k]){
                              skillMatch++
                            }
                            n++
                          }
                          k++
                        }

                        let asuitabilityScore = ((skillMatch/combinedOpportunitySkills.length)*100).toFixed(0)
                           if (!asuitabilityScore){
                            asuitabilityScore = 0
                        }
                        setSuitabilityScore(asuitabilityScore)
                    
                        let thisContract = await catalystDao.initDaoContract(account, allOpportunities[j].contractId)
                        let propFlags
                        // confirm proposal exists
                        let exists
                        try{
                            let index = await thisContract.getProposal({proposalId: parseInt(allOpportunities[j].opportunityId)})
                            if (index){
                                exists = true
                            } else {
                                exists = false
                            }
                        
                        } catch (err) {
                            console.log('error getting proposal', err)
                            exists = false
                        }
                        if(exists){
                          
                           
                            propFlags = await thisContract.getProposalFlags({proposalId: parseInt(allOpportunities[j].opportunityId)})
                            
                            let status = getStatus(propFlags)
                         
                            let contractDid
                            for(let x = 0; x < currentCommunities.length;x++){
                              if(currentCommunities[x].contractId == allOpportunities[j].contractId){
                                contractDid = currentCommunities[x].did
                              }
                            }
                         
                            let result
                            if(contractDid){
                                result = await appIdx.get('daoProfile', contractDid)
                          
                            }
                            if(result && status == 'Passed' && allOpportunities[j].budget > 0 && Date.now() <= new Date(allOpportunities[j].deadline)){
                         
                              currentRecommendations.push({
                                    opportunity: allOpportunities[j],
                                    status: status,
                                    communityLogo: result.logo,
                                    communityName: result.name,
                                    communityPurpose: result.purpose,
                                    baseReward: parseFloat(allOpportunities[j].reward), 
                                    skillMatch: skillMatch, 
                                    allSkills: combinedOpportunitySkills.length,
                                    suitabilityScore: asuitabilityScore,
                                    communityDid: contractDid})
                            }
                        }
                        j++
                    }
                    
                    setRecommendations(currentRecommendations)
                    setRecommendationsLoaded(true)
                 
                  }
            }
            let mounted = true
            if(mounted){
                fetchTab1Data()
                .then(res => {
                    setOppsLoaded(true)
                })
                return () => {
                mounted = false
            } 
        }
    }, [appIdx, currentGuilds, did, isUpdated]
    )

    function handleExpanded() {
        setAnchorEl(null)
    }

    const handleEmailNotificationChange = (event) => {
      emailNotifications ? optout() : optin()
    }

    async function optin() {
      setEmailFinished(false)
      let key = await getSendyAPI()
      let subscribeUrl = `${MAIL_URL}/subscribe`

      let listId
      switch(true) {
        case process.env.ENV == 'test' || process.env.ENV == 'prod':
          listId = process.env.NG_SENDY_LIST_ID
        case process.env.ENV == 'localhost':
          listId = process.env.SENDY_LIST_ID
      }

      let data = {
          api_key: key.data.seed, 
          email: email,
          name: name,
          list: listId,
          boolean: true
      }
      try{
          axiosCall = await axios.post(subscribeUrl,
              qs.stringify(data),
              {
                  headers: {
                      'content-type': 'application/x-www-form-urlencoded'
                  }
              })

      setEmailNotifications(true)
      setEmailFinished(true)
     
      } catch (err) {
          console.log('error subscribing', err)
      }
  }

  async function optout() {
      setEmailFinished(false)
      let key = await getSendyAPI()
      let deleteUrl = `${MAIL_URL}/api/subscribers/delete.php`

      let listId
      switch(true) {
        case process.env.ENV == 'test' || process.env.ENV == 'prod':
          listId = process.env.NG_SENDY_LIST_ID
        case process.env.ENV == 'localhost':
          listId = process.env.SENDY_LIST_ID
      }

      let data = {
          api_key: key.data.seed, 
          email: email,
          list_id: listId
      }
      try{
          axiosCall = await axios.post(deleteUrl,
              qs.stringify(data),
              {
                  headers: {
                      'content-type': 'application/x-www-form-urlencoded'
                  }
              })
   
      setEmailNotifications(false)
      setEmailFinished(true)
      } catch (err) {
          console.log('error subscribing', err)
      }
  }

    return (
        
        <Grid container justifyContent="center" alignItems="flex-start" spacing={1} style={{padding: '5px'}}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '10px'}}>
              <AccountInfo />
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
              {email != '' ? (<FormControlLabel
                value="platformEmailNotification"
                control={<Switch 
                  color="primary" 
                  checked={emailNotifications}
                  onChange={handleEmailNotificationChange}/>}
                label="Email Notifications"
                labelPlacement="start"
              />
              ) : null }
                
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
               <Accordion>
               <AccordionSummary
                 expandIcon={<ExpandMoreIcon />}
                 aria-controls="panel1a-content"
                 id="panel1a-header"
               >
                 <CommunityCount />
               </AccordionSummary>
               <AccordionDetails>
               <Grid container justifyContent="center" alignItems="center" spacing={1}>
                 <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                     <Communities />
                 </Grid>
               </Grid>
               </AccordionDetails>
             </Accordion>
             <Accordion>
               <AccordionSummary
                 expandIcon={<ExpandMoreIcon />}
                 aria-controls="panel2a-content"
                 id="panel2a-header"
               >
                 <MemberCommunityCount memberDaos={memberDaos}/>
               </AccordionSummary>
               <AccordionDetails>
               <Grid container justifyContent="center" alignItems="center" spacing={1}>
                 <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>                      
                     <MemberCommunities memberDaos={memberDaos} />
                 </Grid>
               </Grid>
               </AccordionDetails>
             </Accordion>
            
             <Accordion>
               <AccordionSummary
                 expandIcon={<ExpandMoreIcon />}
                 aria-controls="panel4a-content"
                 id="panel4a-header"
               >
                    <Typography style={{marginRight: '5px'}}>Opportunities</Typography>
                    <Typography color="textSecondary">{recommendations ? recommendations.length : '0'} Available</Typography>
               </AccordionSummary>
               <AccordionDetails>
               <Grid container justifyContent="center" alignItems="center" spacing={1}>
                                       
                    {recommendations && recommendations.length > 0 ?
                        recommendations.map((row, index) => {
                        
                            return (<OpportunityCard
                            creator={row.opportunity.proposer}
                            created={row.opportunity.submitDate}
                            title={row.opportunity.title}
                            details={row.opportunity.details}
                            projectName={row.opportunity.projectName}
                            category={row.opportunity.category}
                            opportunityStatus={row.opportunity.status}
                            permission={row.opportunity.permission}
                            opportunityId={row.opportunity.opportunityId}
                            skillMatch={row.skillMatch}
                            allSkills={row.allSkills}
                            suitabilityScore={row.suitabilityScore}
                            passedContractId={row.opportunity.contractId}
                            deadline={row.opportunity.deadline}
                            budget={row.opportunity.budget}
                            usd={row.opportunity.usd}
                            status={row.status}
                            logo={row.communityLogo}
                            name={row.communityName}
                            communityDid={row.communityDid}
                            />)
                        })
                        : null
                    } 
  
               </Grid>
               </AccordionDetails>
             </Accordion>
             <Accordion>
             <AccordionSummary
               expandIcon={<ExpandMoreIcon />}
               aria-controls="panel2a-content"
               id="panel2a-header"
             >
             <Typography style={{marginRight: '5px'}}>Staking Activity</Typography>
             </AccordionSummary>
             <AccordionDetails>
             <Grid container justifyContent="center" alignItems="center" spacing={1}>
               <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>                      
                <StakingActivity />
               </Grid>
             </Grid>
             </AccordionDetails>
           </Accordion>
           <Accordion>
           <AccordionSummary
             expandIcon={<ExpandMoreIcon />}
             aria-controls="panel2a-content"
             id="panel2a-header"
           >
           <Typography style={{marginRight: '5px'}}>Account Activity</Typography>
           </AccordionSummary>
           <AccordionDetails>
           <Grid container justifyContent="center" alignItems="center" spacing={1}>
             <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>                      
              <AccountTransactionActivity />
             </Grid>
           </Grid>
           </AccordionDetails>
         </Accordion>
            </Grid>       
        </Grid>
        
    )
}