import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { utils } from 'near-api-js'
import Fuse from 'fuse.js'
//import { dao } from '../../utils/dao'
import GuildCard from '../Cards/GuildCard/guildCard'
import SearchBar from '../common/SearchBar/search'
import { GAS, STORAGE, parseNearAmount } from '../../state/near'
import { queries } from '../../utils/graphQueries'

// Material UI components
import { makeStyles } from '@mui/styles'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import Paper from '@mui/material/Paper'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    featureDAO: {
        minHeight: '200px',
        backgroundColor:'#eff3fb',
        padding: '20px',
    },
    paper: {
        padding: '5px',
        textAlign: 'center',
    },
    menuButton: {
      marginRight: '5px',
    },
    title: {
      flexGrow: 1,
      textAlign: 'left'
    },
    drawer: {
        marginTop: '5px'
    }
  }));

  
export default function ExploreGuilds(props) {
   
    const [guilds, setGuilds] = useState([])
    const [guildCount, setGuildCount] = useState(0)

    const [membersOnly, setMembersOnly] = useState(false)
    const [activeOnly, setActiveOnly] = useState(true)
    const [resources, setResources] = useState(0)
    const [searchGuilds, setSearchGuilds] = useState([])
    const [contractId, setContractId] = useState('')
    const [daoPlatform, setDaoPlatform] = useState('')
    
    const [anchorEl, setAnchorEl] = useState(null)
   
    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      currentGuildsList,
      accountId,
      near,
      isUpdated,
      did,
      didRegistryContract,
      nearPrice,
      appIdx
    } = state

    const matches = useMediaQuery('(max-width:500px)')

    let sortedGuilds

    useEffect(
        () => {
            if(isUpdated){}
            console.log('currentGuildsList', currentGuildsList)
            async function fetchData() {
                if(currentGuildsList && near){
                    setGuildCount(currentGuildsList.data.putDIDs.length)
                    sortedGuilds = _.sortBy(currentGuildsList.data.putDIDs, 'registered').reverse()
                    setGuilds(sortedGuilds)                
                }

                // if(currentGuildsList && currentGuildsList.data.putDIDs.length > 0){
                //     let i = 0
                //     let balance = 0
                //     while (i < currentGuildsList.data.putDIDs.length){
                //         let account
                //         let guildDid = currentGuildsList.data.putDIDs[i].did
                //         let guildInfo = await appIdx.get('daoProfile', guildDid)
                //         if(guildInfo.contractId){
                //             setContractId(guildInfo.contractId)
                //             try {
                //                 account = await near.connection.provider.query({
                //                     request_type: "view_account",
                //                     finality: "final",
                //                     account_id: guildInfo.contractId,
                //                 })
                //             } catch (err) {
                //                 console.log('problem retrieving account', err)
                //             }
                //         }
                //         if(account){
                //             let formatted = utils.format.formatNearAmount(account.amount, 0)
                //             balance = balance + parseFloat(formatted)
                //         }
                //         i++
                //     }
                //     setResources(balance)
                // }
            }

        let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
         
          })
        return () => mounted = false
        }

    }, [currentGuildsList, near, isUpdated]
    )

    function handleExpanded() {
        setAnchorEl(null)
    }

    // const handleMembersOnlyChange = async (event) => {
    //     setMembersOnly(event.target.checked)
     
    //     if(event.target.checked){
    //         let contract
    //         let memberGuilds = []
    //         let i = 0
           
    //         while (i < guilds.length){
    //             try{
    //                 contract = await dao.initDaoContract(state.wallet.account(), daos[i].contractId)
    //             } catch (err) {
    //                 console.log('problem initializing dao contract', err)
    //             }

    //             let thisMemberStatus
    //             let thisMemberInfo
    //             try {
    //             thisMemberInfo = await contract.getMemberInfo({member: accountId})
    //             thisMemberStatus = await contract.getMemberStatus({member: accountId})
    //             if(thisMemberStatus && thisMemberInfo[0].active){
    //                 memberDaos.push(daos[i])
    //             } 
    //             } catch (err) {
    //             console.log('no member info yet')
    //             }
    //         i++
    //         }
    //         setDaos(memberDaos)
    //     } else {
    //         let memberDaos = []
    //         setDaos(memberDaos)
    //         let i = 0
         
    //         let sortedDaos = _.sortBy(currentDaosList, 'created').reverse()
    //         while (i < sortedDaos.length){
    //             memberDaos.push(sortedDaos[i])
    //             i++
    //         }
    //         setDaos(memberDaos)
    //     }
    // }

    // const handleStatusChange = async (event) => {
    //     setActiveOnly(event.target.checked)
        
    //     if(event.target.checked){
    //         let contract
    //         let statusCommunity = []
    //         let i = 0
    //         while (i < daos.length){
    //             if(daos[i].status == 'active'){
    //                 statusCommunity.push(daos[i])
    //             } 
    //         i++
    //         }
    //         setDaos(statusCommunity)
    //     } else {
    //         let statusCommunity = []
    //         setDaos(statusCommunity)
    //         let i = 0
    //         let sortedDaos = _.sortBy(currentDaosList, 'created').reverse()
    //         while (i < sortedDaos.length){
    //             statusCommunity.push(sortedDaos[i])
    //             i++
    //         }
    //         setDaos(statusCommunity)
    //     }
    // }

    function makeSearchGuilds(guild){
       let i = 0
        let exists
        let someGuilds = []
        if(guild != false && searchGuilds.length > 0){
            while(i < searchGuilds.length){
                if(searchGuilds[i].contractId == guild.contractId){
                    exists = true
                }
                i++
            }
            if(!exists){
                someGuilds.push(guild)
                setSearchGuilds(someGuilds)
            }
        }
    }

    const searchData = (pattern) => {
        if (!pattern) {
            let sortedGuilds = _.sortBy(currentGuildsList.data.putDIDs, 'registered').reverse()
            setGuilds(sortedGuilds)
            return
        }
        
        const fuse = new Fuse(searchGuilds, {
            keys: ['category']
        })
     

        const result = fuse.search(pattern)

        const matches = []
        if (!result.length) {
            setGuilds([])
        } else {
            result.forEach(({item}) => {
                matches.push(item)
        })
            setGuilds(matches)
        }
    }
  

    return (
        <>
        <div className={classes.root}>
        {!matches ? (<>
            <Grid container alignItems="center" justifyContent="space-evenly" spacing={1}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography style={{color:'#1341a4', fontSize:'80px',fontWeight:'700', marginTop: '30px', lineHeight:'1em', verticalAlign:'middle'}}>
                        Explore {guilds ? guildCount : null} 
                        {guilds && guildCount > 1 ? 'Guilds': null} 
                        {guilds && guildCount == 1 ? 'Guild': null}
                        {guilds && guildCount == 0 ? 'Guilds': null}
                    </Typography>
                </Grid>
            </Grid>
        </>
        ) : (<>
            <Grid container alignItems="center" justifyContent="space-evenly" spacing={1}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography style={{color:'#1341a4', fontSize:'30px',fontWeight:'700', marginTop: '30px', lineHeight:'1em', verticalAlign:'middle'}}>
                        Explore {guilds ? guildCount : null} 
                        {guilds && guildCount > 1 ? ' Guilds': null} 
                        {guilds && guildCount == 1 ? ' Guild': null}
                        {guilds && guildCount == 0 ? ' Guilds': null}
                    </Typography>
                </Grid>
            </Grid>
            </>

        )}
        
        <Grid container alignItems="center" justifyContent="space-between" spacing={0} >
            <Grid item xs={1} sm={1} md={3} lg={3} xl={3}>
            </Grid>
            <Grid item xs={10} sm={10} md={6} lg={6} xl={6}>
            <SearchBar
                placeholder="Search"
                onChange={(e) => searchData(e.target.value)}
            />
            </Grid>
            <Grid item xs={1} sm={1} md={3} lg={3} xl={3}>
            </Grid>
        </Grid>
        <Grid container spacing={1} justifyContent="center" alignItems="center" style={{paddingLeft:'40px', paddingRight:'40px'}}>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {guilds && guildCount > 0 ? 
            (<>
              
            {guilds.map(({accountId, blockTime, did, owner}, i) => {
                console.log('guilds', guilds)
                return ( 
                    <GuildCard
                        key={i}
                        contractId={accountId}
                        created={blockTime}
                        summoner={owner}
                        did={did}
                        link={''}
                        state={state}
                        makeSearchGuilds={makeSearchGuilds}
                        status={'active'}
                    />
               )
            }
            )}
       
            </>)
        : null
        }
        </List>
        </Grid>
       
        </div>
    
        </>
    )
}