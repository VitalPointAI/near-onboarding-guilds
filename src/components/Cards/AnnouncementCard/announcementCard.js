import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../../state/app'

// Material UI Components
import Button from '@mui/material/Button'
import { LinearProgress } from '@mui/material'
import { Grid } from '@mui/material'
import { Typography, TextField } from '@mui/material'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import { Stack } from '@mui/material'
import Chip from '@mui/material/Chip'
import FaceIcon from '@mui/icons-material/Face'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TodayIcon from '@mui/icons-material/Today'

const imageName = require('../../../img/default-profile.png') // default no-image avatar

export default function AnnouncementCard(props) {

  const { state, dispatch, update } = useContext(appStore);

    const [display, setDisplay] = useState(true)

    const [anchorEl, setAnchorEl] = useState(null)
    const [finished, setFinished] = useState(false)

    const { 
      adminId,
      subject,
      message,
      date
   } = props
 
   const {
     isUpdated,
   } = state

    useEffect(
      () => {

      async function fetchData() {
          if(isUpdated){}
      }

      let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
            setFinished(true)
          })
        return () => mounted = false
        }

  }, [isUpdated]
  )

  function handleExpanded() {
    setAnchorEl(null)
  }

  function formatDate(timestamp) {
    //let stringDate = timestamp.toString()
    let options = {year: 'numeric', month: 'long', day: 'numeric'}
    return new Date(parseInt(timestamp.slice(0,13))).toLocaleString('en-US', options)
  }

    return(
        <>
        {!display ? <LinearProgress /> : 
                    
          finished ? 
          (
            <>
            <ListItem alignItems="flex-start">
            <ListItemText
              primary={<><Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center" style={{marginBottom: '3px'}}>
              <Chip icon={<TodayIcon />} label={date ? formatDate(date) : 'none'} />
              <Chip icon={<FaceIcon />} label={adminId} />
              </Stack>
                <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>{subject}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <div dangerouslySetInnerHTML={{ __html: message}}></div>
                </AccordionDetails>
                </Accordion>
                </>
              }
  
            />
            </ListItem>
            <Divider variant="middle" style={{marginTop: '15px', marginBottom: '15px'}}/>
            </>
            ) 
          : null
        }
        </>
    )
}