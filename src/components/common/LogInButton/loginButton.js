import React, { useContext } from 'react'
import { login } from '../../../utils/helpers'
import { appStore, onAppMount } from '../../../state/app'

// Material UI components
import Button from '@mui/material/Button'
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone'

export default function LoginButton(props) {

    
    const { state, update } = useContext(appStore)

    const {
      wallet
    } = state.user

    return (
        <> 
        <Button
        variant="contained"
        color="primary"
        sx={{
          marginTop: '5px',
          float: 'right'
        }}
        style={{marginTop: '-5px'}}
        startIcon={<LockOpenTwoToneIcon />}
        onClick={()=> login(wallet)}
        >Sign In</Button>
           
      </>
    )
}