import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../../state/app'
import { dao } from '../../../utils/dao'

// Material UI Components
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { LinearProgress } from '@mui/material'
import Chip from '@mui/material/Chip'
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'

const imageName = require('../../../img/default_logo.png') // default no-image avatar

export default function MemberOfDaoCard(props) {

    const [sname, setsName] = useState('')
    const [slogo, setsLogo] = useState(imageName)
    const [display, setDisplay] = useState(true)
    const [finished, setFinished] = useState(false)
    const [totalMembers, setTotalMembers] = useState()

    

    const { state, dispatch, update } = useContext(appStore)

    const {
      wallet,
      isUpdated,
      appIdx
    } = state

    const {
      contractId,
      status,
      daoDid
     } = props


    useEffect(
      () => {

      async function fetchData() {
        if(isUpdated){}
         if(contractId && wallet){
           try{
            let contract = await dao.initDaoContract(wallet.account(), contractId)
            let allMembers = await contract.getTotalMembers()
            setTotalMembers(allMembers)
            
           } catch (err) {
             console.log('error retrieving member count', err)
           }

           if(daoDid){
           let result = await appIdx.get('daoProfile', daoDid)
              if(result){
                      result.name != '' ? setsName(result.name) : setsName('')
                      result.logo !='' ? setsLogo(result.logo) : setsLogo(imageName)
              }
            }
         }
      }
        
      let mounted = true
      if(mounted){
        fetchData()
            .then((res) => {
              setFinished(true)
            })
      return () => mounted = false
      }
      
  }, [wallet, isUpdated]
  )
  
    return(
        <>
        {!display ? <LinearProgress /> : 
                     
          finished ? 
          (
            <Card sx={{
              verticalAlign: 'middle',
              margin: '10px 10px 10px 10px',
              padding: '2px'
            }}>
              <CardContent align="center">
              <Link to={`/dao/${contractId}`}>
                <div style={{width: '100%', 
                height: '50px',
                backgroundImage: `url(${slogo})`, 
                backgroundSize: '180px auto', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box'
            }}>
            </div>
            </Link>
               
                <Typography  variant="h6" display="inline" noWrap={true} style={{lineHeight: 0}}>
                  {sname != '' ? sname : contractId.split('.')[0]}
                </Typography><br></br>
                <Chip variant="outlined" label={status} icon={status=='active'? <PlayCircleFilledIcon style={{ color: 'green[500]'}} /> : <PauseCircleFilledIcon style={{color: 'red[500]'}}/>} style={{marginTop: '10px'}}/><br></br>

                <Typography  variant="overline" display="inline" noWrap={true} style={{lineHeight: 0}}>
                  {totalMembers} {totalMembers == 1 ? 'Member' : 'Members'}
                </Typography>
              </CardContent>
            </Card>
          ) 
          : null
        }
        </>
       
    )
}