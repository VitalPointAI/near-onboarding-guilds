import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../../state/app'
import GuildCard from '../../Cards/GuildCard/guildCard'
import { updateCurrentGuilds } from '../../../state/user'

// Material UI components
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
  
export default function Communities(props) {
   
    const[communities, setCommunities] = useState([])
    

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      currentGuilds,
      isUpdated,
      appIdx
    } = state

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
                    setCommunities(sortedGuilds)                
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

    return (
        <>
        <Box sx={{ flexGrow: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'}}>
        
       
        <Grid container alignItems="center" justifyContent="space-between" spacing={3} style={{padding: '20px'}} >
            { communities && communities.length > 0 ? 
                (<>
               
                  <Grid container alignItems="center" justifyContent="space-between" spacing={0} >
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                     
                    </Grid>
                  </Grid>
                <Grid container alignItems="center" justifyContent="center" spacing={3} style={{padding: '20px', minHeight: '150px'}}>
               
                {communities.filter(community => community.owner == accountId).reverse().map(({ accountId, registered, did, owner, type, category }, i) =>
                
                  <GuildCard
                    key={i}
                    contractId={accountId}
                    created={registered}
                    summoner={owner}
                    guildDid={did}
                    state={state}
                    status={'active'}
                    registered={true}
                    category={category} 
                  />   
                )}
               
                </Grid>
            </>)
            : ( 
                <Grid container alignItems="center" justifyContent="center" spacing={0} >
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="body1">This persona has not founded any guilds yet.</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )
            } 
        </Grid>
        </Box>
       
        </>
    )
}