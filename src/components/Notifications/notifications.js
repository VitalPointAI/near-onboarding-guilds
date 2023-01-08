import React, { useState, useEffect, useContext}  from 'react'
import { appStore, onAppMount } from '../../state/app'
import { get, set, del } from '../../utils/storage'
import {ceramic} from '../../utils/ceramic'

//material ui imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import ReplyIcon from '@mui/icons-material/Reply';
import Button from '@mui/material/Button'
import {OPPORTUNITY_NOTIFICATION, PROPOSAL_NOTIFICATION, NEW_NOTIFICATIONS} from '../../state/near' 
import CommentIcon from '@mui/icons-material/Comment';

export default function NotificationCard(props){
    const [open, setOpen] = useState(true)

    const [notifications, setNotifications] = useState([])
    const { state, dispatch, update } = useContext(appStore)
    

    const {
        appIdx, 
      accountId,
      isUpdated
    } = state

    const{
        toolbar,
        header,
        handleNotificationClick
    }=props

    useEffect(() => {
        
        async function fetchData(){
            isUpdated
            if(accountId){
                
                //retrieve all notifications for all accounts from ceramic
                let result = await ceramic.downloadKeysSecret(appIdx, 'notifications')
              
                if(result && result.length > 0){
                        //send the object holding notifications to map for easy access
                        //to specific values
                        let notificationMap = new Map(Object.entries(result[0])) 
                        

                        //set the 'read' flag for all notifications to true
                        for(let i = 0; i < notificationMap.get(accountId).length; i++){
                            notificationMap.get(accountId)[i].read = true
                        }

                        //save notificationMap inside of an array so it can be passed to ceramic
                        let notificationArray = []
                        notificationArray.push(notificationMap) 

                        //send the revised notifications with 'read' flag true to ceramic
                        let result2 = await ceramic.storeKeysSecret(appIdx, notificationArray, 'notifications', appIdx.id)
                        
                        //set the list of notifications to be displayed
                        setNotifications(notificationMap.get(accountId))

                      
                    }
                }

        }
      
        fetchData()
        .then((res) => {
      
        })

    },[state])

    const handleClose = () => {
        handleNotificationClick(false)
        setOpen(!open)
    }

    const handleClick = (notification) => {
        //add indicator to local storage
       if(notification.type == 'opportunities'){
            let notificationFlag = get(OPPORTUNITY_NOTIFICATION, [])
            if(!notificationFlag[0]){
                notificationFlag.push({proposalId: notification.proposalId})
                set(OPPORTUNITY_NOTIFICATION, notificationFlag)
            }
        }
        else if(notification.type == 'dao'){
            let notificationFlag = get(PROPOSAL_NOTIFICATION, [])
            if(!notificationFlag[0]){
                notificationFlag.push({proposalId: notification.proposalId})
                set(PROPOSAL_NOTIFICATION, notificationFlag)
            }
        }
     
     
    }

    let notifs 
 
    if (notifications && notifications.length > 0) {
        let replyFlag; 
        notifs = notifications.slice().reverse().map(notification => {
            if(notification.reply == true){
                replyFlag = true;  
            }
            else{
                replyFlag = false; 
            }
          
            return(
                <Button href={notification.link} onClick={()=>{handleClick(notification)}} style={{minWidth: '100%'}}>
                <Card style={{minWidth: '100%', marginTop: 10}}>
                    <Avatar src={notification.avatar} style={{float:'left', marginRight: '10px'}}/>
                    <>
                    { replyFlag ?  
                    <ReplyIcon fontSize='large'/>: <CommentIcon fontSize='large' />
                    }
                    </>
                    <Typography style={{display: 'inline-block', marginTop: 15}}>{notification.commentAuthor}: {notification.commentPreview}</Typography>
                </Card>
                </Button>
            )
        })
    }
    
    return (
            <div>
            {toolbar ? <>
            <Dialog sx={{ width: 700}} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Notifications</DialogTitle>
              <DialogContent>
              {notifs ? (<>{notifs}</>) : (<Typography>no notifications yet</Typography>)}
              </DialogContent>
            </Dialog>
            </>: <div>{notifs ? (<>{notifs}</>) :
                (
                <Card>
                <Typography>no notifications yet</Typography>
                </Card>)}</div>} 
          </div>

        )
}