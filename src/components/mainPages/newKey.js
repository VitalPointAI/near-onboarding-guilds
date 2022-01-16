import React, { useContext } from 'react'
import { appStore } from '../../state/app'
import SeedSetup from '../SeedSetup/seedSetup'
import Header from '../common/Header/header'
import Footer from '../common/Footer/footer'

// Material UI components
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
  }));
  
export default function NewKey(props) {

    const classes = useStyles()

    const { state } = useContext(appStore)
    
    return (
        <>
        <div className={classes.root}>
        <Header state={state}/>
        <SeedSetup />
        
        </div>
        <Footer />
        </>
        
    )
}