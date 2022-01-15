import React from 'react'

// Material UI components
import Typography from '@mui/material/Typography'

export default function RandomPhrase(props) {
    
    const randomPhrases = [
        'Space Gem is an open web application',
        'Space Gem is powered by NEAR Protocol, Ceramic Network, and The Graph.',
        'We like to think Space Gem is helping shepherd in a new era of work.',
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