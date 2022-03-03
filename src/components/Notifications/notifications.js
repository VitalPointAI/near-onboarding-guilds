import React, { useState, useEffect, useContext}  from 'react'
import { appStore, onAppMount } from '../../state/app'
import { get, set, del } from '../../utils/storage'
import {ceramic} from '../../utils/ceramic'

//material ui imports
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import ReplyIcon from '@material-ui/icons/Reply';
import Button from '@material-ui/core/Button'
import {OPPORTUNITY_NOTIFICATION, PROPOSAL_NOTIFICATION, NEW_NOTIFICATIONS} from '../../state/near' 
import CommentIcon from '@material-ui/icons/Comment';

const useStyles = makeStyles((theme) => ({
    root: {
      Width: 700
    }
}));

export default function NotificationCard(props){
    const [open, setOpen] = useState(true)

    const [notifications, setNotifications] = useState([])
    const { state, dispatch, update } = useContext(appStore)
    const classes = useStyles()

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
                console.log('result', result)
                if(result && result.length > 0){
                        //send the object holding notifications to map for easy access
                        //to specific values
                        let notificationMap = new Map(Object.entries(result[0])) 
                        
                        console.log("Pre-processed map", notificationMap.get(accountId))

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
     
        console.log("NOTIFICATION", notification)
    }

    let notifs 
    console.log('notifications', notifications)

    if (notifications && notifications.length > 0) {
        let replyFlag; 
        notifs = notifications.slice().reverse().map(notification => {
            if(notification.reply == true){
                replyFlag = true;  
            }
            else{
                replyFlag = false; 
            }
            console.log("avatar", notification.avatar)
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
            <Dialog className={classes.root} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
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