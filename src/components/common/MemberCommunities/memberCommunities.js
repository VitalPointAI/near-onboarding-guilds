import React, { useState, useEffect, useContext } from 'react'
import { appStore } from '../../../state/app'
import GuildCard from '../../Cards/GuildCard/guildCard'

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
  
export default function MemberCommunities(props) {
   
    const [daos, setDaos] = useState([])
    const [contract, setContract] = useState()

    const classes = useStyles()

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
console.log('memberDaos', daos)
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
                    <Typography variant="body1">What? This persona has not joined any guilds yet! <br></br><a href='/explore'>Time to explore some.</a></Typography>
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