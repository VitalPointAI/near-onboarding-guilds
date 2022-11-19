import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import Fuse from 'fuse.js'
import GuildCard from '../Cards/GuildCard/guildCard'
import SearchBar from '../common/SearchBar/search'
import { updateCurrentGuilds } from '../../state/near'

// Material UI components
import { makeStyles } from '@mui/styles'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import List from '@mui/material/List'

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
      currentGuilds,
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
            async function fetchData() {
                let theseGuilds = await updateCurrentGuilds()
                update('', {currentGuilds: theseGuilds})
                if(isUpdated){
                    let theseGuilds = await updateCurrentGuilds()
                    update('', {currentGuilds: theseGuilds})
                }
               
                if(currentGuilds && appIdx){
                    setGuildCount(currentGuilds.length)
                    sortedGuilds = _.sortBy(currentGuilds, 'registered').reverse()
                  
                    for(let x = 0; x < sortedGuilds.length; x++){
                        let result = await appIdx.get('guildProfile', sortedGuilds[x].did)
                      
                        if(result){
                            let category
                            result.category ? category = result.category : category = ''
                            let newObject = {...sortedGuilds[x], category: category}
                            sortedGuilds[x] = newObject
                        }
                    }
                  
                    setGuilds(sortedGuilds)                
                }

            }

        let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
         
          })
        return () => mounted = false
        }

    }, [appIdx, isUpdated]
    )

    function handleExpanded() {
        setAnchorEl(null)
    }

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

    const searchData = async (pattern) => {
        if (!pattern) {
            let sortedGuilds = _.sortBy(currentGuilds, 'registered').reverse()
            for(let x = 0; x < sortedGuilds.length; x++){
                let result = await appIdx.get('guildProfile', sortedGuilds[x].did)
                if(result){
                    result.category ? category = result.category : category = ''
                    let newObject = {...sortedGuilds[x], category: category}
                    sortedGuilds[x] = newObject
                }
            }
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
       
        {!matches ? (
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography variant="h4" style={{color:'#1341a4',fontWeight:'700', marginTop: '30px', lineHeight:'1em', verticalAlign:'middle'}}>
                        Explore {guilds ? guildCount : null} 
                        {guilds && guildCount > 1 ? ' Guilds': null} 
                        {guilds && guildCount == 1 ? ' Guild': null}
                        {guilds && guildCount == 0 ? ' Guilds': null}
                    </Typography>
                </Grid>
            

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
        
        ) : (
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography style={{color:'#1341a4', fontSize:'30px',fontWeight:'700', marginTop: '30px', lineHeight:'1em', verticalAlign:'middle'}}>
                        Explore {guilds ? guildCount : null} 
                        {guilds && guildCount > 1 ? ' Guilds': null} 
                        {guilds && guildCount == 1 ? ' Guild': null}
                        {guilds && guildCount == 0 ? ' Guilds': null}
                    </Typography>
                </Grid>
 
         
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
            

        )}
        
        

        <List sx={{ bgcolor: 'background.paper', paddingLeft: '10px', paddingRight: '10px' }}>
          {guilds && guildCount > 0 ? 
            (<>
              
            {guilds.map(({accountId, blockTime, did, owner, category}, i) => {
              
                return ( 
                    <GuildCard
                        key={i}
                        contractId={accountId}
                        created={blockTime}
                        summoner={owner}
                        guildDid={did}
                        link={''}
                        state={state}
                        makeSearchGuilds={makeSearchGuilds}
                        status={'active'}
                        registered={true}
                        category={category}
                    />
               )
            }
            )}
       
            </>)
        : null
        }

        </List>
       
       
        </>
    )
}