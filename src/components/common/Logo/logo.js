import React from 'react'
import { Link } from 'react-router-dom'

// Material UI
import useMediaQuery from '@mui/material/useMediaQuery'

const nearLogo = require('../../../img/my-near-journey.png')

export default function Logo(props) {

    const matches = useMediaQuery('(max-width:500px)');

    return (
        <>        
            <Link to={`/`}>
            {!matches ? (
                <div style={{
                    height: '60px', 
                    marginLeft: '30px',
                    backgroundImage: `url(${nearLogo})`, 
                    backgroundSize: 'contain', 
                    backgroundPosition: 'left', 
                    backgroundRepeat: 'no-repeat',
                    backgroundOrigin: 'content-box'
                }}/>
            ) : (
                <div style={{ 
                    height: '60px', 
                    marginLeft: '10px',
                    backgroundImage: `url(${nearLogo})`, 
                    backgroundSize: 'contain', 
                    backgroundPosition: 'left', 
                    backgroundRepeat: 'no-repeat',
                    backgroundOrigin: 'content-box'
                }}/>
            )}
            </Link>           
        </>
    )
}
