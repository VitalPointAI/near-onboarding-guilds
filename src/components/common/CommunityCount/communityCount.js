import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../../state/app'

// Material UI Components
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'

export default function CommunityCount(props) {
    
    const [finished, setFinished] = useState(false)
    const [daoCount, setDaoCount] = useState()

    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      currentGuilds,
      isUpdated
    } = state

    const matches = useMediaQuery('(max-width:500px)')
   
    useEffect(
        () => {
  
        async function fetchData() {
            setFinished(false)
            if(isUpdated) {}
            if(currentGuilds && currentGuilds.length > 0){
                let count = 0
                let i = 0
                while(i < currentGuilds.length){
                    if(currentGuilds[i].owner == accountId){
                        count++
                    }
                    i++
                }
            setDaoCount(count)
            return true
            }
        }

        fetchData()
            .then((res) => {
             setFinished(true)
            })
        
    }, [isUpdated, currentGuilds]
    )

    return (
        <>    
        <Grid container justifyContent="center" alignItems="center" spacing={1} >        
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="left">
                    <>
                    <Grid container justifyContent="center" alignItems="center" spacing={1} >
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        {!matches ? (
                            <>
                            <div style={{display: 'inline', width: '100%'}}>
                            <Typography variant="body1" color="primary">Founded {daoCount ? daoCount == 1 ? daoCount + ' Guild' : daoCount + '  Guilds' : '0 Guilds'}</Typography>
                            
                            </div>
                            </>
                            ) : (
                            <>
                            <div style={{display: 'inline', width: '100%'}}>
                            <Typography variant="body1" color="primary">Founded {daoCount ? daoCount == 1 ? daoCount + ' Guild' : daoCount + '  Guilds' : '0 Guilds'}</Typography>
                           
                            </div>
                            </>
                        )}
                        </Grid>
                    </Grid>   
                    </>
        
            </Grid>       
        </Grid>
      </>
    )
}