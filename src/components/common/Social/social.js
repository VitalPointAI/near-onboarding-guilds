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

    const {
        did,
        type,
        platform,
        platformLink,
        appIdx
    } = props

    useEffect(
        () => {
            async function retrieveData(){
                if(appIdx && did){
                    let result = await appIdx.get(type =='guild' ? 'guildProfile' : 'profile', did)
                    if(result){
                        result.email ? setEmailLink(`mailto:${result.email}`) : null
                        result.reddit ? setRedditLink(`https://reddit.com/user/${result.reddit}`) : null
                        result.twitter ? setTwitterLink(`https://twitter.com/${result.twitter}`) : null
                        result.telegram ? setTelegramLink(`https://t.me/${result.telegram}`) : null
                        result.discord ? setDiscordLink(result.discord) : null
                        result.website ? setWebsiteLink(`https://${result.website}`) : null
                    }
                }
            }

            retrieveData()
            .then((res) => {

            })
    }, [appIdx, did]
    )

    return (
     <Grid container spacing={1} alignItems="center" justifyContent="space-between" style={{paddingLeft: '15px', paddingRight: '15px'}}>
        {emailLink != '' ?
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <a href={emailLink}>
                <EmailIcon alt="email" />
            </a>
        </Grid>
        : null }
        {redditLink != '' ?
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <a href={redditLink} alt="Reddit" >
                <RedditIcon />
            </a>
        </Grid>
        : null }
        {twitterLink != '' ?
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <a href={twitterLink} alt="Twitter" >
                <TwitterIcon />
            </a>
        </Grid>
        : null }
        {telegramLink != '' ?
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <a href={telegramLink} alt="Telegram">
                <TelegramIcon  />
            </a>
        </Grid>
        : null }
        {discordLink != '' ?
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <a href={discordLink}>
                <img src={discordIcon} alt="Discord" style={{width: '24px', height: 'auto'}}/>
            </a>
        </Grid>
        : null }
        {websiteLink != '' ?
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <a href={websiteLink} alt="website">
                <LanguageIcon  />
            </a>
        </Grid>
        : null }
        {platform && platformLink != '' ?
        <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <a href={platformLink}>
                <img src={platform == 'Catalyst' ? catalystIcon :
            platform== 'Astro' ? astroIcon : null} alt="Catalyst" style={{width: '24px', height: 'auto'}}/>
            </a>
        </Grid>
        : null }
     </Grid>
    )
}