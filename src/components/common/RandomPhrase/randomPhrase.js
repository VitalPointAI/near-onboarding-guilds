import React from 'react'

// Material UI components
import Typography from '@mui/material/Typography'

export default function RandomPhrase(props) {
    
    const randomPhrases = [
        'NEAR Journey is an open web application',
        'NEAR Journey is powered by NEAR Protocol, Ceramic Network, and The Graph.',
        'Please be patient, it will not be much longer now, we promise.',
        'We are gathering all kinds of data goodness from the decentralized, open web.',
    ]

    function getRandomInt(max) {
        return Math.floor(Math.random() * max)
    }

    let randomChoice = getRandomInt(randomPhrases.length)

    return (
        <>
            <Typography variant="h6">{randomPhrases[randomChoice]}</Typography>
      </>
    )
}