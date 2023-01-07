import React, { useContext } from 'react'
import { makeStyles } from '@mui/styles'
import { login } from '../../../utils/helpers'
import { appStore, onAppMount } from '../../../state/app'

// Material UI components
import Button from '@mui/material/Button'
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone'

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: '5px',
    float: 'right'
  },
  accountButton: {
    margin: 0,
    float: 'right',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  }));

export default function LoginButton(props) {

    const classes = useStyles()
    const { update } = useContext(appStore)

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
        startIcon={<LockOpenTwoToneIcon />}
        onClick={()=> login(wallet)}
        >Sign In</Button>
           
      </>
    )
}