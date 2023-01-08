import React, { useState, useEffect, useContext } from 'react'
import { appStore } from '../../../state/app'
import GuildCard from '../../Cards/GuildCard/guildCard'

// Material UI components
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
  
export default function MemberCommunities(props) {
   
    const [daos, setDaos] = useState([])
    const [contract, setContract] = useState()

    

    const { state, dispatch, update } = useContext(appStore)

    const {
      memberDaos
    } = props

    useEffect(
      () => {
       if(memberDaos && memberDaos.length > 0){
         setDaos(memberDaos)
       }
      }, [memberDaos]
    )

    return (
        <>
      
        
       
        <Grid container alignItems="center" justifyContent="space-between" spacing={3} style={{padding: '20px'}} >
            { daos && daos.length > 0 ? 
                (<>
                  
                <Grid container alignItems="center" justifyContent="center" spacing={3} style={{padding: '20px'}}>
                
                {daos.map(({ contractId, status, accountId, registered, did, owner, type, category }, i) =>
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
                    <Typography variant="body1">What? This persona has not joined any guilds yet! <br></br><a href='/guilds'>Time to explore some.</a></Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            )
            } 
        </Grid>
        
       
        </>
    )
}