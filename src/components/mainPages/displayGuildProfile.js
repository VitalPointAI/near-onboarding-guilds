import React from 'react'
import { useParams } from 'react-router-dom'
import GuildProfile from '../Profiles/guildProfile'
  
export default function DisplayGuildProfile(props) {

  const {
    contractId
  } = useParams()
    
    return (
      <GuildProfile member={contractId} />
      )
}