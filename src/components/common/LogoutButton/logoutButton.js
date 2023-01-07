import React, { useContext } from 'react'
import { logout } from '../../../state/user'
import { appStore, onAppMount } from '../../../state/app'

// Material UI components
import { makeStyles } from '@mui/styles'
import Button from '@mui/material/Button'
import LockTwoToneIcon from '@mui/icons-material/LockTwoTone'

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: '5px',
    float: 'right',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0
  },
  accountButton: {
    margin: 0,
    float: 'right',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  }));

export default function LogoutButton(props) {

    const classes = useStyles()
    const { update } = useContext(appStore);

    const {
      wallet
    } = state.user

    return (
        <>
            <Button
            variant="contained"
            color="primary"
            className={classes.button}
            style={{marginTop: '-5px'}}
            startIcon={<LockTwoToneIcon />}
            onClick={() => logout(wallet)}
            >Sign Out</Button>
      </>
    )
}