import React from 'react'
import { useParams } from 'react-router-dom'
import IndivProfile from '../Profiles/indivProfile'
  
export default function DisplayIndivProfile(props) {

  const {
    indivDid
  } = useParams()
  
    return (
      <IndivProfile indivDid={indivDid} />
      )
}