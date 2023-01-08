import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../../state/app'

// Material UI components
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'


export default function Intro(props) {
  const [open, setOpen] = useState(true)
  const [intro, setIntro] = useState('')
  
 
  const { state, dispatch, update } = useContext(appStore)
  
  const { 
    handleIntroClickState, 
    personDid
  } = props
  
  const {
    appIdx
  } = state

    useEffect(
      () => {

        async function fetchData(){
          if(personDid){
            let person = await appIdx.get('profile', personDid)
            person ? setIntro(person.intro) : setIntro('No intro yet!')
          }
        }
        fetchData()
      }, []
      )

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleIntroClickState(false)
  }


  return (
    <div>
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Quick Intro</DialogTitle>
        <DialogContent sx={{
          rootForm: {
            '& > *': {
              margin: '10px',
            },
          }
        }}>
              <Card>
              <CardContent>
                <div dangerouslySetInnerHTML={{ __html: intro}}></div>
              </CardContent>
          </Card>
          </DialogContent>
        <DialogActions>
     
        <Button onClick={handleClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
