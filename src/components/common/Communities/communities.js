import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../../state/app'
import GuildCard from '../../Cards/GuildCard/guildCard'
import { updateCurrentGuilds } from '../../../state/near'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

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
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    menuButton: {
      marginRight: theme.spacing(0),
    },
    title: {
      flexGrow: 1,
      textAlign: 'left'
    },
    drawer: {
        marginTop: '5px'
    }
  }));
  
export default function Communities(props) {
   
    const[communities, setCommunities] = useState([])
    const classes = useStyles()

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
        <div className={classes.root}>
        
       
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
        </div>
       
        </>
    )
}