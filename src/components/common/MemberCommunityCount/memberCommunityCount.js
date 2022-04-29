import React, { useState, useEffect, useContext } from 'react'

// Material UI Components
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'

export default function MemberCommunityCount(props) {
    
    const [finished, setFinished] = useState(false)
    const [daoCount, setDaoCount] = useState()
    const [memberCount, setMemberCount] = useState(0)

    const {
        memberDaos
    } = props

    const matches = useMediaQuery('(max-width:500px)')
   
    useEffect(
        () => {
            if(memberDaos && memberDaos.length > 0){
                console.log('memberdaos', memberDaos)
                setMemberCount(memberDaos.length)
            }
  
    }, [memberDaos]
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
                           
                                <Typography variant="body1" color="primary">Member of {memberCount == 1? memberCount + ' Guild' : memberCount + ' Guilds' }</Typography>
                            
                           
                            </div>
                            </>
                            ) : (
                            <>
                            <div style={{display: 'inline', width: '100%'}}>
                          
                            <Typography variant="body1" color="primary">Member of {memberCount == 1? memberCount + ' Guild' : memberCount + ' Guilds' }</Typography>
                        
                           
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