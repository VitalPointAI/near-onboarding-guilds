import React, { useContext, useState, useEffect } from 'react'
import { appStore, onAppMount } from '../../state/app'
import AnnouncementCard from '../Cards/AnnouncementCard/announcementCard'

// Material UI Components
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import List from '@mui/material/List'

export default function Announcements(props) {
    
    const matches = useMediaQuery('(max-width:500px)')

    const { state, dispatch, update } = useContext(appStore)
    const[announces, setAnnounces] = useState([])

    const {
        announcements,
        isUpdated
    } = state.app

    useEffect(()=> {
        if(announcements && !announcements.length){
            announces.push(announcements)
        }
        if(announcements || isUpdated){}

    },[isUpdated, announcements])
 
    return(
            <List sx={{ bgcolor: 'background.paper', paddingLeft: '10px', paddingRight: '10px' }}>
            {announcements && announcements.length > 0 ? 
            (<>
                
            {announcements.reverse().map(({adminId, subject, message, date}, i) => {
               
                return ( 
                    <AnnouncementCard
                        key={i}
                        adminId={adminId}
                        subject={subject}
                        message={message}
                        date={date}
                    />
                )
            }
            )}
        
            </>)
            : announces.length > 0 ?
                (<>
                {announces.map(({adminId, subject, message, date}, i) => {
                  
                    return ( 
                        <AnnouncementCard
                            key={i}
                            adminId={adminId}
                            subject={subject}
                            message={message}
                            date={date}
                        />
                    )
                    })
                }
                </>)
                : <Typography variant="h5" sx={{textAlign: 'center',
                fontWeight: 700,
                paddingTop: 30, 
                paddingBottom: 60}}>No Announcements Yet</Typography>
            }

        </List>
    )
}