import React, { useState } from 'react'


// Material UI components
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'


export default function GoToPersonas(props) {
  const [open, setOpen] = useState(true)
  
  
  const { 
    handleEditGuildClickState
  } = props
  
  const handleClickOpen = () => {
    setOpen(true)
  };

  const handleClose = () => {
    handleEditGuildClickState(false)
  }

  return (
    <div>
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Oops</DialogTitle>
        <DialogContent sx={{
          rootForm: {
            '& > *': {
              margin: '10px',
            },
          },
        }}>
              <Card>
              <CardContent>
                <Typography variant="body1">Looks like this is a registered Persona. Please head on over to <a href="https://nearpersonas.live">NEAR Personas</a> to manage it.</Typography>
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
