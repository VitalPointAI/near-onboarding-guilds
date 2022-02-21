import React from 'react'
import { makeStyles } from '@mui/styles'
import { login } from '../../../state/near'

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

    return (
        <> 
        <Button
        variant="contained"
        color="primary"
        className={classes.button}
        style={{marginTop: '-5px'}}
        startIcon={<LockOpenTwoToneIcon />}
        onClick={login}
        >Sign In</Button>
           
      </>
    )
}