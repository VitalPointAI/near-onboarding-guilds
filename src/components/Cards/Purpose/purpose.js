import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../../state/app'
import { ceramic } from '../../../utils/ceramic'

// Material UI components
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

export default function Purpose(props) {
  const [open, setOpen] = useState(true)
  const [purpose, setPurpose] = useState('')
  
 
  const { state, dispatch, update } = useContext(appStore)
  
  const { 
    handlePurposeClickState, 
    contractId,
  } = props
  
  const {
    factoryContract,
    registryContract,
    appIdx
  } = state

    useEffect(
      () => {

        async function fetchData(){
          if(contractId){
            let contractDid = await ceramic.getDid(contractId, factoryContract, registryContract)
            let community = await appIdx.get('guildProfile', contractDid)
            community ? setPurpose(community.purpose) : setPurpose('Not set yet!')
          }
        }
        fetchData()
      }, []
      )

  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handlePurposeClickState(false)
  }


  return (
    <div>
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Guild Purpose</DialogTitle>
        <DialogContent sx={{
          rootForm: {
            '& > *': {
              margin: '10px',
            },
          }
        }}>
              <Card>
              <CardContent>
                <div dangerouslySetInnerHTML={{ __html: purpose}}></div>
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
