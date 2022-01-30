import React, { useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom'
import ImageLoader from '../ImageLoader/imageLoader'
import clsx from 'clsx'
import { appStore, onAppMount } from '../../../state/app'
import defaultProfileImage from '../../../img/default-profile.png'
import EditProfileForm from '../../EditProfile/editProfile'
import EditGuildProfileForm from '../../EditProfile/editGuild'

// Material UI
import { makeStyles, useTheme } from '@mui/styles'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import AddBoxIcon from '@mui/icons-material/AddBox'
import EditIcon from '@mui/icons-material/Edit'
import FavoriteIcon from '@mui/icons-material/Favorite'
import DiamondIcon from '@mui/icons-material/Diamond'
import Avatar from '@mui/material/Avatar'
import GroupIcon from '@mui/icons-material/Group'
import ExploreIcon from '@mui/icons-material/Explore'
import useMediaQuery from '@mui/material/useMediaQuery'
import InfoIcon from '@mui/icons-material/Info'
import CodeIcon from '@mui/icons-material/Code'
import SchoolIcon from '@mui/icons-material/School'
import ContactSupportIcon from '@mui/icons-material/ContactSupport'
import PieChartIcon from '@mui/icons-material/PieChart'
import NotificationsIcon from '@mui/icons-material/Notifications'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import SettingsIcon from '@mui/icons-material/Settings'
import Badge from '@mui/material/Badge'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'
import LeaderboardIcon from '@mui/icons-material/Leaderboard'

const useStyles = makeStyles((theme) => ({
    list: {
        width: 250,
        padding: '10px',
      },
    fullList: {
        width: 'auto',
    },
    menuButton: {
        marginTop: '5px',
        float: 'left',
        
    },
    small: {
        width: '50',
        height: '50',
        float: 'right',
      },
  }));

export default function LeftSideDrawer(props) {

const classes = useStyles()
const matches = useMediaQuery('(max-width:500px)')

const [anchorEl, setAnchorEl] = useState(null);
const [editProfileClicked, setEditProfileClicked] = useState(false)
const [editGuildProfileClicked, setEditGuildProfileClicked] = useState(false)
const [notificationsClicked, setNotificationsClicked] = useState(false)
const [newNotifications, setNewNotifications] = useState(0)

const { state, update } = useContext(appStore);

const [drawerState, setDrawerState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

const {
  wallet,
  accountId,
  isUpdated,
  curUserIdx,
  did,
  accountType
} = state

// useEffect(
//   () => {

    // async function fetchData(){
    //   if(isUpdated){}
    //   if(accountId){
    //     //get the list of all notifications for all accounts
    //     let result = await ceramic.downloadKeysSecret(appIdx, 'notifications')
    //     if(result){

    //         //convert the object from ceramic to map in order to more easily
    //         //return notifications associated with current account
    //         if(result[0]){
    //           let notificationMap = new Map(Object.entries(result[0])) 

    //           let notifications = 0;

    //           //loop thorugh all notifications for user, if the read flag is false, increase the count
    //           //for the notification badge
    //           if(notificationMap.get(accountId)){
    //             for(let i = 0; i < notificationMap.get(accountId).length; i++){
    //                 if(notificationMap.get(accountId)[i].read == false){
    //                     notifications++;
    //                 }
    //             }
    //           }
            

    //         //set the counter for the badge to the amount of unread notifications
    //         setNewNotifications(notifications)
    //         }
    //     }
    //   }
    // }

//     let intervalController = setInterval(checkDash, 500)
//     function checkDash(){
//       let newVisit = get(DASHBOARD_DEPARTURE, [])
//       if(newVisit[0]){
         
//           if(newVisit[0].status=="true" && !newVisit[1]){
//           setStepsEnabled(true)
//           setDrawerState({ ...drawerState, ['left']: true})
//           newVisit.push({arrived: 'true'})
//           set(DASHBOARD_DEPARTURE, newVisit)
//         }
//         clearInterval(intervalController)
//       }
//     }

//     fetchData()
//     .then((res) => {
  
//     })
//   }, [isUpdated, accountId]
// )

const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
}

function handleEditProfileClickState(property){
    setEditProfileClicked(property)
}

const editProfileClick = (event) => {
    setEditProfileClicked(true)
    handleClick(event)
}

function handleEditGuildProfileClickState(property){
  setEditGuildProfileClicked(property)
}

const editGuildProfileClick = (event) => {
  setEditGuildProfileClicked(true)
  handleClick(event)
}

function handleNotificationClick(property){
  setNotificationsClicked(property)
}

// const notificationsClick = (event) => {
//     setNotificationsClicked(true)
//     handleClick(event)
// }

const toggleDrawer = (anchor, open) => (event) => {
if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
    return
}

setDrawerState({ ...drawerState, [anchor]: open });
}

const list = (anchor) => (
<div
    className={clsx(classes.list, {
    [classes.fullList]: anchor === 'top' || anchor === 'bottom',
    })}
    role="presentation"
    onClick={toggleDrawer(anchor, false)}
    onKeyDown={toggleDrawer(anchor, false)}
>
{!matches ? (
  <div className='toolbar'>
    <List>
      <Link to='/'>
        <ListItem button key={1}>
          <ListItemIcon><PieChartIcon /></ListItemIcon>
          <ListItemText primary='Dashboard'/>
        </ListItem>
      </Link>
      <ListItem button key={7}>
       
        <ListItemIcon>
          <Badge badgeContent={newNotifications} color='primary'>   
          <NotificationsIcon />
          </Badge>
        </ListItemIcon>
        
        <ListItemText onClick={(e) => notificationsClick(e)} primary='Notifications'/>
      </ListItem>
    </List>
    <Divider />
    <Typography variant='h6'>Account</Typography>
    <List>
      <ListItem className='editProfile' button key={3} onClick={(e) => addPersonaClick(e)}>
        <ListItemIcon><AddBoxIcon /></ListItemIcon>
        <ListItemText primary='Edit Profile'/>
      </ListItem>
     
      <Link to='/setup'>
        <ListItem className='recoverKey' button key={4}>
        <ListItemIcon><LocalHospitalIcon /></ListItemIcon>
        <ListItemText primary='Recover Profile'/>
      </ListItem>
    </Link>
    <Link to='/registration'>
      <ListItem className='registration' button key={5}>
      <ListItemIcon><AppRegistrationIcon /></ListItemIcon>
      <ListItemText primary='Registration'/>
    </ListItem>
    </Link>
    </List>
    <Divider />
    <Typography variant='h6'>Rewards</Typography>
    <List>
    <Link to='/leaderboards'>
      <ListItem className='exploreleaderboards' button key={6}>
      <ListItemIcon><LeaderboardIcon /></ListItemIcon>
      <ListItemText primary='Leaderboards'/>
      </ListItem>
    </Link>
    <Link to='/rewards'>
        <ListItem className='exploreRewards' button key={7}>
        <ListItemIcon><EmojiEventsIcon /></ListItemIcon>
        <ListItemText primary='Explore Rewards'/>
        </ListItem>
    </Link>
    </List>
    
    <Divider />
  </div>
  ) :
    wallet.signedIn ? (
      <>
        <List>
            <Link to='/'>
                <ListItem button key={1}>
                <ListItemIcon><PieChartIcon /></ListItemIcon>
                <ListItemText primary='Dashboard'/>
                </ListItem>
            </Link>
        </List>
        <Divider />

        <Typography variant='h6'>Account</Typography>
        <List>
          <ListItem button key={2} onClick={(e) => accountType == 'guild' ? editGuildProfileClick(e) : editProfileClick(e)}>
              <ListItemIcon><EditIcon /></ListItemIcon>
              <ListItemText primary='Edit Profile'/>
          </ListItem>
          <Link to='/setup'>
            <ListItem className='recoverKey' button key={4}>
            <ListItemIcon><LocalHospitalIcon /></ListItemIcon>
            <ListItemText primary='Recover Profile'/>
          </ListItem>
          </Link>
          <Link to='/registration'>
          <ListItem className='registration' button key={5}>
            <ListItemIcon><AppRegistrationIcon /></ListItemIcon>
            <ListItemText primary='Manage Registration'/>
          </ListItem>
        </Link>
        </List>
        <Divider />
        <Typography variant='h6'>Discover</Typography>
        <List>      
        <Link to='/guilds'>
          <ListItem className='exploreGuilds' button key={6}>
            <ListItemIcon><ExploreIcon /></ListItemIcon>
            <ListItemText primary='Explore Guilds'/>
          </ListItem>
        </Link>
        <Link to='/people'>
        <ListItem className='exploreIndividuals' button key={7}>
            <ListItemIcon><GroupIcon /></ListItemIcon>
            <ListItemText primary='Explore People'/>
          </ListItem>
        </Link>
        </List>
        <Divider />
        <Typography variant='h6'>Rewards</Typography>
        <List>
        <Link to='/leaderboards'>
          <ListItem className='exploreleaderboards' button key={8}>
          <ListItemIcon><LeaderboardIcon /></ListItemIcon>
          <ListItemText primary='Leaderboards'/>
          </ListItem>
        </Link>
        <Link to='/rewards'>
            <ListItem className='exploreRewards' button key={9}>
            <ListItemIcon><EmojiEventsIcon /></ListItemIcon>
            <ListItemText primary='Explore Rewards'/>
            </ListItem>
        </Link>
        </List>
        
        <Divider />
    </>
    ) : null }
    
    <Typography variant='h6' style={{marginTop:'50px'}}></Typography>
    <List>
    <a href='/'>
      <ListItem button key={10}>
        <ListItemIcon><InfoIcon /></ListItemIcon>
        <ListItemText primary='About My NEAR Journey'/>
      </ListItem>
    </a>
    <a href='/'>
      <ListItem button key={11}>
        <ListItemIcon><SchoolIcon /></ListItemIcon>
        <ListItemText primary='Learn'/>
      </ListItem>
    </a>
    <a href='/'>
      <ListItem button key={12}>
        <ListItemIcon><ContactSupportIcon /></ListItemIcon>
        <ListItemText primary='Contact'/>
      </ListItem>
    </a>
    </List>
    
</div>
)

return (
    <React.Fragment key={'left'}>
        <IconButton edge="start" className={classes.menuButton} style={{marginTop: '5px', paddingLeft: 3, color: 'white', padding: 5}} aria-label="menu" onClick={toggleDrawer('left', true)}>
        <MenuIcon style={{fontSize: 35}}/>
        </IconButton>
  
        <Drawer anchor={'left'} open={drawerState['left']} onClose={toggleDrawer('left', false)}>
        {list('left')}
        </Drawer>

        {editProfileClicked ? <EditProfileForm
            state={state}
            handleEditProfileClickState={handleEditProfileClickState}
            accountId={accountId}
            did={did}
            curUserIdx={curUserIdx}
        /> : null }

        {editGuildProfileClicked ? <EditGuildProfileForm
          state={state}
          handleEditGuildProfileClickState={handleEditGuildProfileClickState}
          accountId={accountId}
          did={did}
          curUserIdx={curUserIdx}
        /> : null }

        {notificationsClicked ? 
        <NotificationCard
        toolbar={true}
        state={state}
        handleNotificationClick={handleNotificationClick}
        />: null
        }

    </React.Fragment>   
    )
}
