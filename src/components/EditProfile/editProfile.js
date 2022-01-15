import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import FileUpload from '../common/IPFSUpload/fileUpload'
import { flexClass } from '../../App'
import { ceramic, IPFS_PROVIDER } from '../../utils/ceramic' 
import { config } from '../../state/config'
import * as nearAPI from 'near-api-js'

// Material UI components
import { makeStyles } from '@mui/styles'
import InfoIcon from '@mui/icons-material/Info'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails';
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Input from '@mui/material/Input'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Rating from '@mui/material/Rating'
import FormLabel from '@mui/material/FormLabel'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Checkbox from '@mui/material/Checkbox'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EmailIcon from '@mui/icons-material/Email'
import RedditIcon from '@mui/icons-material/Reddit'
import TwitterIcon from '@mui/icons-material/Twitter'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Zoom from '@mui/material/Zoom'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddBoxIcon from '@mui/icons-material/AddBox'

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
    progress: {
      width: '100%',
      '& > * + *': {
        marginTop: '10px',
      },
    },
    input: {
      minWidth: 100,
      maxWidth: 400,
    },
    heading: {
      fontSize: '15px',
      flexBasis: '33.33%',
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: '15px',
      color: "#000000",
    },
    large: {
        width: '100px',
        height: '100px',
        textAlign: 'center'
    }, 
    formControl: {
      margin: '20px',
    },
    hide: {
      display: 'none'
    },
    waiting: {
      minWidth: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      padding: '20px'
    }
    }));

const imageName = require('../../img/default-profile.png') // default no-image avatar
const discordIcon = require('../../img/discord-icon.png')

export const {
  FUNDING_DATA, FUNDING_DATA_BACKUP, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, FACTORY_DEPOSIT, DAO_FIRST_INIT, CURRENT_DAO, REDIRECT,
  NEW_PROPOSAL, NEW_SPONSOR, NEW_CANCEL, KEY_REDIRECT, OPPORTUNITY_REDIRECT, NEW_PROCESS, NEW_VOTE, NEW_DONATION, NEW_EXIT, NEW_RAGE, NEW_DELEGATION, NEW_REVOCATION,
  networkId, nodeUrl, walletUrl, nameSuffix, factorySuffix, explorerUrl,
  contractName, didRegistryContractName, factoryContractName
} = config

export default function EditProfileForm(props) {

    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState(imageName)
    const [shortBio, setShortBio] = useState('')
    const [email, setEmail] = useState('')
    const [discord, setDiscord] = useState('')
    const [reddit, setReddit] = useState('')
    const [twitter, setTwitter] = useState('')
    const [birthdate, setBirthdate] = useState('')
    const [country, setCountry] = useState('')
    const [language, setLanguage] = useState([])
    const [skill, setSkill] = useState([])
    const [familiarity, setFamiliarity] = useState('0')
   
    
    const [otherSkills, setOtherSkills] = useState([])
    const [notifications, setNotifications] = useState([])

    const [avatarLoaded, setAvatarLoaded] = useState(true)
    const [progress, setProgress] = useState(false)

    const { state, dispatch, update } = useContext(appStore)

    const countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
    const languages = ['Abkhazian','Afar','Afrikaans','Akan','Albanian','Amharic','Arabic','Aragonese','Armenian','Assamese','Avaric','Avestan','Aymara','Azerbaijani','Bambara','Bashkir','Basque','Belarusian','Bengali','Bihari languages','Bislama','Bosnian','Breton','Bulgarian','Burmese','Catalan, Valencian','Central Khmer','Chamorro','Chechen','Chichewa, Chewa, Nyanja','Chinese','Church Slavonic, Old Bulgarian, Old Church Slavonic','Chuvash','Cornish','Corsican','Cree','Croatian','Czech','Danish','Divehi, Dhivehi, Maldivian','Dutch, Flemish','Dzongkha','English','Esperanto','Estonian','Ewe','Faroese','Fijian','Finnish','French','Fulah','Gaelic, Scottish Gaelic','Galician','Ganda', 'Georgian','German','Gikuyu, Kikuyu','Greek (Modern)','Greenlandic, Kalaallisut','Guarani','Gujarati','Haitian, Haitian Creole','Hausa','Hebrew','Herero','Hindi','Hiri Motu','Hungarian','Icelandic','Ido','Igbo','Indonesian','Interlingua (International Auxiliary Language Association)','Interlingue','Inuktitut','Inupiaq','Irish','Italian','Japanese','Javanese','Kannada','Kanuri','Kashmiri','Kazakh','Kinyarwanda','Komi','Kongo','Korean','Kwanyama, Kuanyama','Kurdish','Kyrgyz','Lao','Latin','Latvian','Letzeburgesch, Luxembourgish','Limburgish, Limburgan, Limburger','Lingala','Lithuanian','Luba-Katanga','Macedonian','Malagasy','Malay','Malayalam','Maltese','Manx','Maori','Marathi','Marshallese','Moldovan, Moldavian, Romanian','Mongolian','Nauru','Navajo, Navaho','Northern Ndebele','Ndonga','Nepali','Northern Sami','Norwegian','Norwegian Bokmål','Norwegian Nynorsk','Nuosu, Sichuan Yi','Occitan (post 1500)','Ojibwa','Oriya','Oromo','Ossetian, Ossetic','Pali','Panjabi, Punjabi','Pashto, Pushto','Persian','Polish','Portuguese','Quechua','Romansh','Rundi','Russian','Samoan','Sango','Sanskrit','Sardinian','Serbian','Shona','Sindhi','Sinhala, Sinhalese','Slovak','Slovenian','Somali','Sotho, Southern','South Ndebele','Spanish, Castilian','Sundanese','Swahili','Swati','Swedish','Tagalog','Tahitian','Tajik','Tamil','Tatar','Telugu','Thai','Tibetan','Tigrinya','Tonga (Tonga Islands)','Tsonga','Tswana','Turkish','Turkmen','Twi','Uighur, Uyghur','Ukrainian','Urdu','Uzbek','Venda','Vietnamese','Volap_k','Walloon','Welsh','Western Frisian','Wolof','Xhosa','Yiddish','Yoruba','Zhuang, Chuang','Zulu' ]
    
    const [skillSet, setSkillSet] = useState([{}])
    const [developerSkillSet, setDeveloperSkillSet] = useState([{}])

    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()
    const {
      fields: personaSkillsFields,
      append: personaSkillsAppend,
      remove: personaSkillsRemove} = useFieldArray({
     name: "personaSkills",
     control
    })

    const {
      fields: personaSpecificSkillsFields,
      append: personaSpecificSkillsAppend,
      remove: personaSpecificSkillsRemove} = useFieldArray({
     name: "personaSpecificSkills",
     control
    })

    const personaSkills = watch('personaSkills', personaSkillsFields)
    const personaSpecificSkills = watch('personaSpecificSkills', personaSpecificSkillsFields)

    const {
        handleEditProfileClickState,
        handleProfileEdit,
        curUserIdx,
        accountId,
        did
    } = props

    const {
      near,
      appIdx,
      currentDaosList,
      isUpdated,
      didRegistryContract
    } = state

    const {
      contractId
    } = useParams()
    
    const classes = useStyles()

    let base 

    let currentSkillsArray = []
    let currentSpecificSkillsArray = []
    let currentSkills = {}
    let currentSpecificSkills = {}

    useEffect(() => {
      if(avatar != imageName && avatarLoaded){
        setProgress(false)
      }
      if(avatar != imageName && !avatarLoaded){
        setProgress(true)
      }
    }, [avatar, avatarLoaded]
    )

    useEffect(() => {
        async function fetchData() {
          setLoaded(false)

           // Set Card Persona Idx       
           if(accountId && currentDaosList){
          
              let result = await appIdx.get('profile', did)   
           
              if(result) {
                result.date ? setDate(result.date) : setDate('')
                result.avatar ? setAvatar(result.avatar) : setAvatar(imageName)
                result.shortBio ? setShortBio(result.shortBio) : setShortBio('')
                result.name ? setName(result.name) : setName('')
                result.email ? setEmail(result.email): setEmail('')
                result.discord ? setDiscord(result.discord): setDiscord('')
                result.birthdate ? setBirthdate(result.birthdate): setBirthdate('')
                result.country ? setCountry(result.country): setCountry('')
                result.language ? setLanguage(result.language): setLanguage([])
                result.skill ? setSkill(result.skill): setSkill([])
                result.familiarity? setFamiliarity(result.familiarity): setFamiliarity('0')
                result.notifications? setNotifications(result.notifications): setNotifications([])
               if(result.skillSet){
                setSkillSet(result.skillSet)
              }
              if(result.developerSkillSet){
                setDeveloperSkillSet(result.developerSkillSet)
              } 
                result.personaSkills? setValue('personaSkills', result.personaSkills): setValue('personaSkills', {name: ''})
                result.personaSpecificSkills? setValue('personaSpecificSkills', result.personaSpecificSkills): setValue('personaSpecificSkills', {name: ''})
              } else {
                await refreshSkills(currentDaosList)
              }

           }
        }
       
        fetchData()
          .then((res) => {
            setLoaded(true)
          })
    },[currentDaosList])

    function handleFileHash(hash) {  
      setAvatar(IPFS_PROVIDER + hash)
    }

    function handleAvatarLoaded(property){
      setAvatarLoaded(property)
    }

    async function refreshSkills(daos){
      if(currentDaosList && currentDaosList.length > 0){
        let i = 0
       
        while (i < currentDaosList.length){
          if(currentDaosList[i].status == 'active'){
            let daoAccount = new nearAPI.Account(near.connection, currentDaosList[i].contractId)
            
            let thisCurDaoIdx = await ceramic.getUserIdx(daoAccount, appIdx, near, didRegistryContract)
            console.log('currentskills', currentSkills)
            // Get Existing Community Skills
            if(thisCurDaoIdx){
              let daoProfileResult = await thisCurDaoIdx.get('daoProfile', thisCurDaoIdx.id)
              console.log('daoProfile', daoProfileResult)
             // let currentSkills = {...skillSet[0]}
             // console.log('currentskills', currentSkills)
             // let currentSpecificSkills = {...developerSkillSet[0]}
              
              if(daoProfileResult){
                daoProfileResult.skills.map((name, value) => {
                  let exists = false
                  console.log('name', name.name)
                  
                    Object.entries(currentSkills).map(([key, value]) => {
                      console.log('key', key)
                      console.log('value', value)
                      if((key).toLowerCase() == (name.name).toLowerCase()){
                        console.log('here')
                        exists = true
                      }
                    })
                  console.log('exists', exists)
                  if(!exists){
                    currentSkills = ({...currentSkills, [name.name]: false})
                  }
                })
              
                daoProfileResult.specificSkills.map((name, value) => {
                  let exists = false
                  Object.entries(currentSpecificSkills).map(([key, value]) => {
                    if((key).toLowerCase() == (name.name).toLowerCase()){
                      exists = true
                    }
                  })
                  if(!exists){
                    currentSpecificSkills = ({...currentSpecificSkills, [name.name]: false})
                  }
                })
                
              }
            }
          }
        i++
        }
        setSkillSet(currentSkills)
        setDeveloperSkillSet(currentSpecificSkills)
      }
    }

    const handleClose = () => {
        handleEditProfileClickState(false)
        setOpen(false)
    }

    const handleNameChange = (event) => {
        let value = event.target.value;
        setName(value)
    }
    const handleEmailChange = (event) => {
       let value = event.target.value;
       setEmail(value)
    }
    const handleDiscordChange = (event) => {
      let value = event.target.value;
      setDiscord(value) 
    }
    const handleRedditChange = (event) => {
      let value = event.target.value;
      setReddit(value);
    }
    const handleCountryChange = (event) => {
      let value = event.target.value;
      setCountry(value);
    }
    const handleTwitterChange = (event) =>{
      let value = event.target.value;
      setTwitter(value); 
    }
    const handleBirthdateChange = (event) => {
      let value = event.target.value.toString() 
      setBirthdate(value); 
    }
    const handleLanguageChange = (event) => {
      let value = event.target.value
      setLanguage(value)
    }
   
    const handleRatingChange = (event, newValue) => {
      if(newValue != null){
        setFamiliarity(newValue.toString())
      }
    }
    
    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
    }
    const handleSkillSetChange = (event) => {
    //  let tempSkillArray = []
      let newSkills = { ...skillSet, [event.target.name]: event.target.checked }
    //  tempSkillArray.push(newSkills)
      setSkillSet(newSkills)
    }
  
    const handleDeveloperSkillSetChange = (event) => {
      let newSkills = { ...developerSkillSet, [event.target.name]: event.target.checked }
      setDeveloperSkillSet(newSkills)
    }

    const handleOtherSkillsChange = (event) => {
      setOtherSkills(event.target.value.split(","))
    }
    
    const onSubmit = async (values) => {
        event.preventDefault();
        setFinished(false)
        let now = new Date().getTime()
       
        let formattedDate = formatDate(now)
        
        let record = {
            date: formattedDate,
            owner: state.accountId,
            name: name,
            avatar: avatar,
            shortBio: shortBio,
            email: email,
            discord: discord,
            twitter: twitter,
            reddit: reddit,
            birthdate: birthdate,
            country: country,
            language: language,
            familiarity: familiarity,
            skillSet: skillSet,
            developerSkillSet: developerSkillSet,
            personaSkills: personaSkills,
            personaSpecificSkills: personaSpecificSkills,
            notifications: notifications
        }
     
        let result = await curUserIdx.set('profile', record)
  
      setFinished(true)
      update('', { isUpdated: !isUpdated })
      handleProfileEdit(true)
      setOpen(false)
      handleClose()
    }

        return (
           
            <div>
       
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            { loaded ? (<>
              <DialogTitle id="form-dialog-title">Profile Data</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Provide as much detail as you'd like.
                  </DialogContentText>
                  <div>
                    <Grid container spacing={1} style={{marginBottom: '5px'}}>
                      <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                        <Avatar
                          alt={accountId}
                          src={avatar} 
                          className={avatarLoaded ? classes.large : classes.hide}
                          imgProps={{
                            onLoad:(e) => { handleAvatarLoaded(true) }
                          }}  
                        />
                        {progress ?
                          <CircularProgress />
                        : null }
                      </Grid>
                      <Grid item xs={10} sm={10} md={10} lg={10} xl={10}>
                        <FileUpload handleFileHash={handleFileHash} handleAvatarLoaded={handleAvatarLoaded}/>
                      </Grid>
                    </Grid>
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                      >
                      <Typography variant="h6">General Information</Typography>
                      <Tooltip TransitionComponent={Zoom} title="Here you can add information to let people, and communities know some basic information about yourself.">
                             <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                      </Tooltip>
                      </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="profile-name"
                                variant="outlined"
                                name="name"
                                label="Name"
                                placeholder="Billy Jo Someone"
                                value={name}
                                onChange={handleNameChange}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="profile-birthdate"
                                type = "date"
                                name="birthdate"
                                label="Birthdate"
                                value={birthdate}
                                onChange={handleBirthdateChange}
                                InputLabelProps={{shrink: true,}}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid> 
                              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <FormControl className={classes.input}>
                                  <InputLabel id="country-label">Country</InputLabel>
                                  <Select
                                    className={classes.input}
                                    label = "Country"
                                    id = "profile-country"
                                    value = {country}
                                    onChange = {handleCountryChange}
                                    input={<Input />}
                                    >
                                    {countries.map((country) => (
                                      <MenuItem key={country} value={country}>
                                        {country}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <FormControl>
                                <InputLabel id="language-label">Languages</InputLabel>
                                <Select multiple
                                  className={classes.input}
                                  label = "Language"
                                  id = "profile-language"
                                  value = {language}
                                  onChange = {handleLanguageChange}
                                  input={<Input />}
                                  >
                                  {languages.map((language) => (
                                      <MenuItem key={language} value={language}>
                                        {language}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  <FormHelperText>Select the languages you are comfortable with.</FormHelperText>
                                </FormControl>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                        <Accordion style={{marginBottom: '20px'}}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                  >
                  <Typography variant="h6">Skills and Competencies</Typography>
                  </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <FormControl component="fieldset" className={classes.formControl}>
                        <FormLabel component="legend">General Skills, Competencies and Values</FormLabel>
                        <FormGroup>
                        {loaded ? 
                              Object.entries(skillSet).map(([key, value]) => {
                                console.log('key', key)
                                console.log('value', value)
                               return (
                                    <FormControlLabel
                                      control={<Checkbox checked={value} onChange={handleSkillSetChange} name={key} />}
                                      label={key}
                                    />
                                )
                              })
                            
                        : null }
                        </FormGroup>
                        
                        <FormHelperText>Check off as appropriate.</FormHelperText>
                      </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <FormControl component="fieldset" className={classes.formControl}>
                          <FormLabel component="legend">Specific Skills</FormLabel>
                          <FormGroup>
                          {loaded ?
                            Object.entries(developerSkillSet).map(([key, value]) => {
                              console.log('key', key)
                              console.log('value', value)
                               return (
                                    <FormControlLabel
                                      control={<Checkbox checked={value} onChange={handleDeveloperSkillSetChange} name={key} />}
                                      label={key}
                                    />
                                 
                                )
                              })
                        : null }
                         
                          
                          </FormGroup>
                          <FormHelperText>Check off the specific skills you have.</FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                        <Typography variant="body1" style={{marginTop: '10px', marginBottom:'10px'}}>Additional General Skills</Typography>
                        {
                          personaSkillsFields.map((field, index) => {
                          return(
                            
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                            <TextField
                              
                              margin="dense"
                              id={`personaSkills[${index}].name`}
                              variant="outlined"
                              name={`personaSkills[${index}].name`}
                              defaultValue={field.name}
                              label="Skill Name:"
                              InputProps={{
                                endAdornment: <div>
                                <Tooltip TransitionComponent={Zoom} title="Short name of skill.">
                                    <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                                </Tooltip>
                                </div>
                              }}
                              inputRef={register({
                                  required: true                              
                              })}
                            />
                            {errors[`personaSkills${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a skill name.</p>}
                            
                            <Button type="button" onClick={() => personaSkillsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                              <DeleteForeverIcon />
                            </Button>
                            </Grid>
                            
                          )
                        }) 
                        }
                        {!personaSkillsFields || personaSkillsFields.length == 0 ?
                          <Typography variant="body1" style={{marginLeft: '5px'}}>No additional general skills defined yet. Add them for better chance of being matched to opportunities.</Typography>
                        : null }
                          <Button
                            type="button"
                            onClick={() => personaSkillsAppend({name: ''})}
                            startIcon={<AddBoxIcon />}
                          >
                            Add Skill
                          </Button>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                        <Typography variant="body1" style={{marginTop: '10px', marginBottom:'10px'}}>Additional Specific Skills</Typography>
                        {
                          personaSpecificSkillsFields.map((field, index) => {
                          return(
                            
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                            <TextField
                              
                              margin="dense"
                              id={`personaSpecificSkills[${index}].name`}
                              variant="outlined"
                              name={`personaSpecificSkills[${index}].name`}
                              defaultValue={field.name}
                              label="Skill Name:"
                              InputProps={{
                                endAdornment: <div>
                                <Tooltip TransitionComponent={Zoom} title="Short name of skill.">
                                    <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                                </Tooltip>
                                </div>
                              }}
                              inputRef={register({
                                  required: true                              
                              })}
                            />
                            {errors[`personaSpecificSkills${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a skill name.</p>}
                            
                            <Button type="button" onClick={() => personaSpecificSkillsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                              <DeleteForeverIcon />
                            </Button>
                            </Grid>
                            
                          )
                        }) 
                        }
                        {!personaSpecificSkillsFields || personaSpecificSkillsFields.length == 0 ?
                          <Typography variant="body1" style={{marginLeft: '5px'}}>No additional general skills defined yet. Add them for better chance of being matched to opportunities.</Typography>
                        : null }
                          <Button
                            type="button"
                            onClick={() => personaSpecificSkillsAppend({name: ''})}
                            startIcon={<AddBoxIcon />}
                          >
                            Add Skill
                          </Button>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <Typography>Familiarity with Crypto/Blockchain</Typography>
                            <Rating name="Familiarity" onChange={handleRatingChange} value={parseInt(familiarity)} />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
              </Accordion>
                      <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                      >
                      <Typography variant="h6">Accounts and Notifications</Typography>
                      <Tooltip TransitionComponent={Zoom} title="Here you can add some of your social media handles if you would like fellow Catalyst users to be able to find or contact you elsewhere.">
                        <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                      </Tooltip>
                      </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="input-with-icon-grid"
                                id="profile-email"
                                variant="outlined"
                                name="email"
                                label="Email"
                                placeholder="someone@someplace"
                                value={email}
                                onChange={handleEmailChange}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <EmailIcon />
                                    </InputAdornment>
                                  ),
                                }}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="profile-discord"
                                variant="outlined"
                                name="discord"
                                label="Discord"
                                placeholder="someone#1234"
                                value={discord}
                                onChange={handleDiscordChange}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <img src={discordIcon} style={{width: '24px', height: 'auto'}}/>
                                    </InputAdornment>
                                  ),
                                }}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="profile-twitter"
                                variant="outlined"
                                name="twitter"
                                label="Twitter"
                                placeholder="some user"
                                value={twitter}
                                onChange={handleTwitterChange}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <TwitterIcon />
                                    </InputAdornment>
                                  ),
                                }}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="profile-reddit"
                                variant="outlined"
                                name="reddit"
                                label="Reddit"
                                placeholder="some user"
                                value={reddit}
                                onChange={handleRedditChange}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <RedditIcon />
                                    </InputAdornment>
                                  ),
                                }}
                                inputRef={register({
                                    required: false                              
                                })}
                              />
                            </Grid>
                          </Grid>

                        </AccordionDetails>
                      </Accordion>
                  </div>
              
                  <div>
               
                  </div>
                </DialogContent>
               
              {!finished ? <LinearProgress className={classes.progress} style={{marginBottom: '25px' }}/> : (
              <DialogActions>
              <Button onClick={handleSubmit(onSubmit)} color="primary" type="submit">
                  Submit Details
                </Button>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
              </DialogActions>)}
              <Divider style={{marginBottom: 10}}/>
              
              </>) : <><div className={classes.waiting}><div class={flexClass}><CircularProgress/></div><Grid container spacing={1} alignItems="center" justifyContent="center" >
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography variant="h5" align="center">Loading Persona Data</Typography>
              </Grid>
              </Grid></div></> }
            </Dialog>
           
          </div>
        
        )
}