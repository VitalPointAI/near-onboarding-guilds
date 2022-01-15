import React from 'react'
import { Link } from 'react-router-dom'

// Material UI
import useMediaQuery from '@mui/material/useMediaQuery'

const spaceGemLogo = require('../../../img/space-gem-logo.png')

export default function Logo(props) {

    const matches = useMediaQuery('(max-width:500px)');

    return (
        <>        
            <Link to={`/`}>
            {!matches ? (
                <div style={{
                    height: '60px', 
                    marginLeft: '30px',
                    backgroundImage: `url(${spaceGemLogo})`, 
                    backgroundSize: 'contain', 
                    backgroundPosition: 'left', 
                    backgroundRepeat: 'no-repeat',
                    backgroundOrigin: 'content-box'
                }}/>
            ) : (
                <div style={{ 
                    height: '60px', 
                    marginLeft: '10px',
                    backgroundImage: `url(${spaceGemLogo})`, 
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
