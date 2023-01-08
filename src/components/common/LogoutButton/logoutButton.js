import React, { useContext } from 'react'
import { logout } from '../../../utils/helpers'
import { appStore, onAppMount } from '../../../state/app'

// Material UI components
import Button from '@mui/material/Button'
import LockTwoToneIcon from '@mui/icons-material/LockTwoTone'


export default function LogoutButton(props) {

    
    const { state, update } = useContext(appStore);

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
              float: 'right',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0
            }}
            style={{marginTop: '-5px'}}
            startIcon={<LockTwoToneIcon />}
            onClick={() => logout(wallet)}
            >Sign Out</Button>
      </>
    )
}