import React from 'react'
import { useParams } from 'react-router-dom'
import GuildProfile from '../Profiles/guildProfile'
  
export default function DisplayGuildProfile(props) {

  const {
    guildDid
  } = useParams()
  
    return (
      <GuildProfile guildDid={guildDid} />
      )
}