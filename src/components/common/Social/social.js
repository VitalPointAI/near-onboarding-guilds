import React, { useState, useEffect} from 'react'
import { Link } from 'react-router-dom'

// Material-UI Components
import { Grid } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import RedditIcon from '@mui/icons-material/Reddit'
import TwitterIcon from '@mui/icons-material/Twitter'
import TelegramIcon from '@mui/icons-material/Telegram'
import LanguageIcon from '@mui/icons-material/Language'

const discordIcon = require('../../../img/discord-icon.png')
const catalystIcon = require('../../../img/catalyst.png')
const astroIcon = require('../../../img/astro.png')

export default function Social(props){

    const [emailLink, setEmailLink] = useState('')
    const [redditLink, setRedditLink] = useState('')
    const [twitterLink, setTwitterLink] = useState('')
    const [telegramLink, setTelegramLink] = useState('')
    const [discordLink, setDiscordLink] = useState('')
    const [websiteLink, setWebsiteLink] = useState('')
    const [catalystLink, setCatalystLink] = useState('')
    const [astroLink, setAstroLink] = useState('')

    const {
        did,
        type,
        platform,
        appIdx
    } = props

    useEffect(
        () => {
            async function retrieveData(){
                if(appIdx && did){
                    let result = await appIdx.get(type =='guild' ? 'daoProfile' : 'profile', did)
                    if(result){
                        result.email ? setEmailLink(`mailto:${result.email}`) : null
                        result.reddit ? setRedditLink(`https://reddit.com/user/${result.reddit}`) : null
                        result.twitter ? setTwitterLink(`https://twitter.com/${result.twitter}`) : null
                        result.telegram ? setTelegramLink(`https://t.me/${result.telegram}`) : null
                        result.discord ? setDiscordLink(result.discord) : null
                        result.website ? setWebsiteLink(`https://${result.website}`) : null
                        platform == 'Catalyst' ? setCatalystLink(`https://cdao.app/dao/${contractId}`) : null
                        platform == 'Astro' ? setAstroLink(`https://app.astrodao.com/dao/${contractId}`) : null
                    }
                }
            }

            retrieveData()
            .then((res) => {

            })
    }, [appIdx, did]
    )

    return (
     <Grid container spacing={1} alignItems="center" justifyContent="space-between">
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <Link to={emailLink}>
                <EmailIcon alt="email" />
            </Link>
        </Grid>
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <Link to={redditLink}>
                <RedditIcon alt="Reddit" />
            </Link>
        </Grid>
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <Link to={twitterLink}>
                <TwitterIcon alt="Twitter" />
            </Link>
        </Grid>
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <Link to={telegramLink}>
                <TelegramIcon alt="Telegram" />
            </Link>
        </Grid>
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <Link to={discordLink}>
                <img src={discordIcon} alt="Discord" style={{width: '24px', height: 'auto'}}/>
            </Link>
        </Grid>
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <Link to={websiteLink}>
                <LanguageIcon alt="website" />
            </Link>
        </Grid>
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            {platform == 'Catalyst' ?
            <Link to={catalystLink}>
                <img src={catalystIcon} alt="Catalyst" style={{width: '24px', height: 'auto'}}/>
            </Link>
            : null }
            {platform == 'Astro' ?
            <Link to={astroLink}>
                <img src={astroIcon} alt="Astro" style={{width: '24px', height: 'auto'}}/>
            </Link>
            : null }
        </Grid>
     </Grid>
    )
}