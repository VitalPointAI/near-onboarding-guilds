import React from 'react'
import { Link } from 'react-router-dom'
import ImageLoader from '../ImageLoader/imageLoader'
import spaceGemLogo from '../../../img/space-gem-logo.png'
import projectLogo from '../../../img/pistolshrimp.png'
import './footer.css'

import useMediaQuery from '@mui/material/useMediaQuery'
import Typography from '@mui/material/Typography'

const Footer = ({}) => {
    const matches = useMediaQuery('(max-width:500px)')

    return (
    !matches ? 
        <div className="footer">
            <div className="left">
                <a href="https://vitalpoint.ai">
                    <ImageLoader image={projectLogo} style={{height: "4em", marginTop: '8px'}} />
                </a>
            
                <div className="footertext">
                <Typography variant="body2" style={{fontSize: '90%'}}>A Pistol Shrimp Project.<br></br>
                    Space management<br></br>
                    of the future.</Typography>
                
                </div>
            </div>
            <div align="center">
                <Link to="/">
                <ImageLoader image={spaceGemLogo} style={{height: "6em", marginLeft: '-90px'}} />
                </Link>
            </div>
            <div className="footerright">
            <Typography variant="body2" style={{fontSize: '90%'}}>Space Gem is open source.<br></br>
            Provided "as is".<br></br>No warranty of any kind.<br></br>Use at own risk.<br></br>
            <span className="blue">Privacy<span className="black"> | </span>TOS</span></Typography>
        </div>
        </div>
        :
        <>
        <div className="footer-mobile">
        <div className="left">
            <a href="https://vitalpoint.ai">
                <ImageLoader image={projectLogo} style={{height: "4em", marginTop: '8px'}} />
            </a>
        
            <div className="footertext">
                <Typography variant="body2" style={{fontSize: '90%'}}>A Pistol Shrimp project.<br></br>
                Space management<br></br>
                of the future.</Typography><br></br>
                <span className="blue">Privacy<span className="black"> | </span>TOS</span></Typography>
            
            </div>
        </div>
        <div className="footerright">
            <Typography variant="body2" style={{fontSize: '90%'}}>Space Gem is open source.<br></br>
            Provided "as is".<br></br>
            No warranty of any kind.<br></br>
            Use at own risk.
        </div>
        </div>
        </>
    )
}

export default Footer