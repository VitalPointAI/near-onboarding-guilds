import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import Fuse from 'fuse.js'
import IndivCard from '../Cards/IndivCard/indivCard'
import SearchBar from '../common/SearchBar/search'

// Material UI components
import { makeStyles } from '@mui/styles'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import List from '@mui/material/List'

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    featureDAO: {
        minHeight: '200px',
        backgroundColor:'#eff3fb',
        padding: '20px',
    },
    paper: {
        padding: '5px',
        textAlign: 'center',
    },
    menuButton: {
      marginRight: '5px',
    },
    title: {
      flexGrow: 1,
      textAlign: 'left'
    },
    drawer: {
        marginTop: '5px'
    }
  }));

  
export default function ExploreIndividuals(props) {
   
    const [individuals, setIndividuals] = useState([])
    const [individualCount, setIndividualCount] = useState(0)

    const [membersOnly, setMembersOnly] = useState(false)
    const [activeOnly, setActiveOnly] = useState(true)
    const [resources, setResources] = useState(0)
    const [searchIndividuals, setSearchIndividuals] = useState([])
    const [contractId, setContractId] = useState('')
    const [daoPlatform, setDaoPlatform] = useState('')
    
    const [anchorEl, setAnchorEl] = useState(null)
   
    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      currentIndividualsList,
      accountId,
      near,
      isUpdated,
      did,
      didRegistryContract,
      nearPrice,
      appIdx
    } = state

    const matches = useMediaQuery('(max-width:500px)')

    let sortedIndividuals

    useEffect(
        () => {
            if(isUpdated){}
            console.log('currentIndividualsList', currentIndividualsList)
            async function fetchData() {
                if(currentIndividualsList && near){
                    setIndividualCount(currentIndividualsList.data.putDIDs.length)
                    sortedIndividuals = _.sortBy(currentIndividualsList.data.putDIDs, 'registered').reverse()
                    setIndividuals(sortedIndividuals)                
                }
            }

        let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
         
          })
        return () => mounted = false
        }

    }, [currentIndividualsList, near, isUpdated]
    )

    function handleExpanded() {
        setAnchorEl(null)
    }

    function makeSearchIndividuals(individual){
       let i = 0
        let exists
        let someIndividuals = []
        if(individual != false && searchIndividuals.length > 0){
            while(i < searchIndividuals.length){
                if(searchIndividuals[i].contractId == individual.accountId){
                    exists = true
                }
                i++
            }
            if(!exists){
                someIndividuals.push(individual)
                setSearchIndividuals(someIndividuals)
            }
        }
    }

    const searchData = (pattern) => {
        if (!pattern) {
            let sortedIndividuals = _.sortBy(currentIndividualsList.data.putDIDs, 'registered').reverse()
            setIndividuals(sortedIndividuals)
            return
        }
        
        const fuse = new Fuse(searchIndividuals, {
            keys: ['category']
        })
     

        const result = fuse.search(pattern)

        const matches = []
        if (!result.length) {
            setIndividuals([])
        } else {
            result.forEach(({item}) => {
                matches.push(item)
        })
            setIndividuals(matches)
        }
    }
  

    return (
        <>
        <div className={classes.root}>
    
        {!matches ? (<>
            <Grid container alignItems="center" justifyContent="space-evenly" spacing={1}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography style={{color:'#1341a4', fontSize:'80px',fontWeight:'700', marginTop: '30px', lineHeight:'1em', verticalAlign:'middle'}}>
                        Meet {individuals ? individualCount : null} 
                        {individuals && individualCount > 1 ? ' People': null} 
                        {individuals && individualCount == 1 ? ' Person': null}
                        {individuals && individualCount == 0 ? ' People': null}
                    </Typography>
                </Grid>
            </Grid>
        </>
        ) : (<>
            <Grid container alignItems="center" justifyContent="space-evenly" spacing={1}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography style={{color:'#1341a4', fontSize:'30px',fontWeight:'700', marginTop: '30px', lineHeight:'1em', verticalAlign:'middle'}}>
                        Meet {individuals ? individualCount : null} 
                        {individuals && individualCount > 1 ? ' People': null} 
                        {individuals && individualCount == 1 ? ' Person': null}
                        {individuals && individualCount == 0 ? ' People': null}
                    </Typography>
                </Grid>
            </Grid>
            </>

        )}
        
        <Grid container alignItems="center" justifyContent="space-between" spacing={0} >
            <Grid item xs={1} sm={1} md={3} lg={3} xl={3}>
            </Grid>
            <Grid item xs={10} sm={10} md={6} lg={6} xl={6}>
            <SearchBar
                placeholder="Search"
                onChange={(e) => searchData(e.target.value)}
            />
            </Grid>
            <Grid item xs={1} sm={1} md={3} lg={3} xl={3}>
            </Grid>
        </Grid>
        <Grid container spacing={0} justifyContent="center" alignItems="center" style={{paddingLeft:'10px', paddingRight:'10px'}}>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {individuals && individualCount > 0 ? 
            (<>
              
            {individuals.map(({accountId, blockTime, did, owner}, i) => {
                console.log('individuals', individuals)
                return ( 
                    <IndivCard
                        key={i}
                        personId={accountId}
                        created={blockTime}
                        did={did}
                        link={''}
                        state={state}
                        makeSearchIndividuals={makeSearchIndividuals}
                    />
               )
            }
            )}
       
            </>)
        : null
        }

        </List>
        </Grid>
     
        </div>
    
        </>
    )
}