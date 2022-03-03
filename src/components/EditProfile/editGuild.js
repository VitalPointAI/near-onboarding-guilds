import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import FileUpload from '../common/IPFSUpload/fileUpload'
import { flexClass } from '../../App'
import { ceramic, IPFS_PROVIDER } from '../../utils/ceramic'
import * as nearAPI from 'near-api-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js'
import { Editor } from "react-draft-wysiwyg"

// Material UI components
import { makeStyles } from '@mui/styles'
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
import Switch from '@mui/material/Switch'
import Card from '@mui/material/Card'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Input from '@mui/material/Input'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import Paper from '@mui/material/Paper'
import EmailIcon from '@mui/icons-material/Email'
import RedditIcon from '@mui/icons-material/Reddit'
import TwitterIcon from '@mui/icons-material/Twitter'
import TelegramIcon from '@mui/icons-material/Telegram'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Zoom from '@mui/material/Zoom'
import Tooltip from '@mui/material/Tooltip'
import { InputAdornment } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddBoxIcon from '@mui/icons-material/AddBox'

import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

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
    square: {
      width: '175px',
      height: 'auto'
    },
    id: {
      display: 'none'
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    waiting: {
      minWidth: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      padding: '20px'
    }
    }));

const imageName = require('../../img/default_logo.png') // default no-image avatar
const discordIcon = require('../../img/discord-icon.png')

export default function EditGuildProfileForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [logo, setLogo] = useState(imageName)
    const [purpose, setPurpose] = useState(EditorState.createEmpty())
    const [category, setCategory] = useState('')
    const [webhook, setWebhook] = useState('')
    const [platform, setPlatform] = useState('')
    const [country, setCountry] = useState('')
    const [language, setLanguage] = useState([])
    const [contractId, setContractId] = useState('')
    const [discordActivated, setDiscordActivated] = useState(false)
    const [proposalsActivated, setProposalsActivated] = useState(false)
    const [passedProposalsActivated, setPassedProposalsActivated] = useState(false)
    const [votingActivated, setVotingActivated] = useState(false) 
    const [sponsorActivated, setSponsorActivated] = useState(false) 
    const [email, setEmail] = useState('')
    const [twitter,setTwitter] = useState('')
    const [discord, setDiscord] = useState('')
    const [website, setWebsite] = useState('')
    const [telegram, setTelegram] = useState('')
    const [reddit, setReddit] = useState('')
    const [addDisabled, setAddDisabled] = useState(true)

    const [nftContractId, setNftContractId] = useState('')
    const [nfts, setNfts] = useState([])
    const [profileNft, setProfileNft] = useState('')

    
    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])

    const countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
    const languages = ['Abkhazian','Afar','Afrikaans','Akan','Albanian','Amharic','Arabic','Aragonese','Armenian','Assamese','Avaric','Avestan','Aymara','Azerbaijani','Bambara','Bashkir','Basque','Belarusian','Bengali','Bihari languages','Bislama','Bosnian','Breton','Bulgarian','Burmese','Catalan, Valencian','Central Khmer','Chamorro','Chechen','Chichewa, Chewa, Nyanja','Chinese','Church Slavonic, Old Bulgarian, Old Church Slavonic','Chuvash','Cornish','Corsican','Cree','Croatian','Czech','Danish','Divehi, Dhivehi, Maldivian','Dutch, Flemish','Dzongkha','English','Esperanto','Estonian','Ewe','Faroese','Fijian','Finnish','French','Fulah','Gaelic, Scottish Gaelic','Galician','Ganda', 'Georgian','German','Gikuyu, Kikuyu','Greek (Modern)','Greenlandic, Kalaallisut','Guarani','Gujarati','Haitian, Haitian Creole','Hausa','Hebrew','Herero','Hindi','Hiri Motu','Hungarian','Icelandic','Ido','Igbo','Indonesian','Interlingua (International Auxiliary Language Association)','Interlingue','Inuktitut','Inupiaq','Irish','Italian','Japanese','Javanese','Kannada','Kanuri','Kashmiri','Kazakh','Kinyarwanda','Komi','Kongo','Korean','Kwanyama, Kuanyama','Kurdish','Kyrgyz','Lao','Latin','Latvian','Letzeburgesch, Luxembourgish','Limburgish, Limburgan, Limburger','Lingala','Lithuanian','Luba-Katanga','Macedonian','Malagasy','Malay','Malayalam','Maltese','Manx','Maori','Marathi','Marshallese','Moldovan, Moldavian, Romanian','Mongolian','Nauru','Navajo, Navaho','Northern Ndebele','Ndonga','Nepali','Northern Sami','Norwegian','Norwegian Bokmål','Norwegian Nynorsk','Nuosu, Sichuan Yi','Occitan (post 1500)','Ojibwa','Oriya','Oromo','Ossetian, Ossetic','Pali','Panjabi, Punjabi','Pashto, Pushto','Persian','Polish','Portuguese','Quechua','Romansh','Rundi','Russian','Samoan','Sango','Sanskrit','Sardinian','Serbian','Shona','Sindhi','Sinhala, Sinhalese','Slovak','Slovenian','Somali','Sotho, Southern','South Ndebele','Spanish, Castilian','Sundanese','Swahili','Swati','Swedish','Tagalog','Tahitian','Tajik','Tamil','Tatar','Telugu','Thai','Tibetan','Tigrinya','Tonga (Tonga Islands)','Tsonga','Tswana','Turkish','Turkmen','Twi','Uighur, Uyghur','Ukrainian','Urdu','Uzbek','Venda','Vietnamese','Volap_k','Walloon','Welsh','Western Frisian','Wolof','Xhosa','Yiddish','Yoruba','Zhuang, Chuang','Zulu' ]
   
    const [avatarLoaded, setAvatarLoaded] = useState(true)
    const [progress, setProgress] = useState(false)

    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()
   
    
    const {
       fields: skillsFields,
       append: skillsAppend,
       remove: skillsRemove} = useFieldArray({
      name: "skills",
      control
    })

    const { 
      fields: specificSkillsFields,
      append: specificSkillsAppend,
      remove: specificSkillsRemove } = useFieldArray({
      name: "specificSkills",
      control
    })

    const skills = watch('skills', skillsFields)
    const specificSkills = watch('specificSkills', specificSkillsFields)
    
  
    const { state, dispatch, update } = useContext(appStore)

    const {
        handleEditGuildClickState,
        curUserIdx,
        accountId,
        did
    } = props

    const {
      appIdx,
      isUpdated
    } = state
    
    const classes = useStyles()
console.log('platform', platform)
    useEffect(() => {
        if(logo != imageName && avatarLoaded){
          setProgress(false)
        }
        if(logo != imageName && !avatarLoaded){
          setProgress(true)
        }
      }, [logo, avatarLoaded]
      )
   
    useEffect(() => {
        async function fetchData() {
            setLoaded(false)

            if(accountId && did && curUserIdx){
           
               
            
                let webhook = await ceramic.downloadKeysSecret(curUserIdx, 'apiKeys')
                if(webhook && Object.keys(webhook).length > 0){
                    setWebhook(webhook[0].api) 
                }
                else{
                    setWebhook('')
                }

                let result = await appIdx.get('daoProfile', did)
                if(result) {
                    if(result.purpose){
                        let contentBlock = htmlToDraft(result.purpose)
                        if(contentBlock){
                            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
                            const editorState = EditorState.createWithContent(contentState)
                            setPurpose(editorState)
                        }
                    } else {
                        setPurpose(EditorState.createEmpty())
                    }
                result.name ? setName(result.name) : setName('')
                result.date ? setDate(result.date) : setDate('')
                result.logo ? setLogo(result.logo) : setLogo(imageName)
                result.contractId ? setContractId(result.contractId) : setContractId('')
                result.skills ? setValue('skills', result.skills) : setValue('skills', {'name': ''})
                result.specificSkills ? setValue('specificSkills', result.specificSkills) : setValue('specificSkills', {'name': ''})
                result.category ? setCategory(result.category) : setCategory('')
                result.discordActivation ? setDiscordActivated(true) : setDiscordActivated(false)
                result.proposalActivation ? setProposalsActivated(true) : setProposalsActivated(false)
                result.passedProposalActivation ? setPassedProposalsActivated(true) : setPassedProposalsActivated(false)
                result.sponsorActivation ? setSponsorActivated(true) : setSponsorActivated(false)
                result.reddit? setReddit(result.reddit) : setReddit('')
                result.discord? setDiscord(result.discord): setDiscord('')
                result.twitter? setTwitter(result.twitter): setTwitter('')
                result.email? setEmail(result.email): setEmail('')
                result.telegram? setTelegram(result.telegram): setTelegram('')
                result.website? setWebsite(result.website): setWebsite('')
                result.country ? setCountry(result.country): setCountry('')
                result.language ? setLanguage(result.language): setLanguage([])
                result.platform ? setPlatform(result.platform) : setPlatform('')
                result.likes ? setCurrentLikes(result.likes) : setCurrentLikes([])
                result.dislikes ? setCurrentDisLikes(result.dislikes) : setCurrentDisLikes([])
                result.neutrals ? setCurrentNeutrals(result.neutrals) : setCurrentNeutrals([])  
            }
           }
        }
       
        fetchData()
          .then((res) => {
            setLoaded(true)
          })
    },[curUserIdx, appIdx, accountId, did])

    function handleFileHash(hash) {
      setLogo(IPFS_PROVIDER + hash)
    }

    const handleClose = () => {
        handleEditGuildClickState(false)
        setOpen(false)
    }

    function handleAvatarLoaded(property){
        setAvatarLoaded(property)
    }

    const handleNameChange = (event) => {
        let value = event.target.value;
        setName(value)
    }

    const handleCategoryChange = (event) => {
      let value = event.target.value;
      setCategory(value)
    }
    const handleWebhookChange = (event) => {
      let value = event.target.value;
      setWebhook(value)
    }

    const handleLanguageChange = (event) => {
        let value = event.target.value
        setLanguage(value)
    }

    const handleCountryChange = (event) => {
        let value = event.target.value;
        setCountry(value);
    }
   
    function formatDate(timestamp) {
      let intDate = parseInt(timestamp)
      let options = {year: 'numeric', month: 'long', day: 'numeric'}
      return new Date(intDate).toLocaleString('en-US', options)
    }

    const handlePurposeChange = (editorState) => {
      setPurpose(editorState)
    }
    const handleDiscordActivation = () => {
      setDiscordActivated(!discordActivated) 
    }
    const handleProposalActivation = () => {
      setProposalsActivated(!proposalsActivated)
    }
    const handlePassedProposalActivation = () => {
      setPassedProposalsActivated(!passedProposalsActivated)
    }
    const handleSponsorActivation = () => {
      setSponsorActivated(!sponsorActivated)
    }
    const handleTwitterChange = (event) =>{
      let value = event.target.value;
      setTwitter(value); 
    }
    const handleEmailChange = (event) =>{
      let value = event.target.value;
      setEmail(value); 
    }
    const handleTelegramChange = (event) =>{
      let value = event.target.value;
      setTelegram(value); 
    }
    const handleWebsiteChange = (event) =>{
      let value = event.target.value;
      setWebsite(value); 
    }

    const handlePlatformChange = (event) => {
      let value = event.target.value
      setPlatform(value)
    }

    const handleContractIdChange = (event) => {
        let value = event.target.value
        setContractId(value)
    }

    const handleDiscordChange = (event) =>{
      let value = event.target.value;
      setDiscord(value); 
    }
    const handleRedditChange = (event) =>{
      let value = event.target.value;
      setReddit(value); 
    }

    const onSubmit = async (values) => {
        event.preventDefault();
        setFinished(false)
        let now = new Date().getTime()
        let foundingDate
        if (date == ''){
            foundingDate = formatDate(now)
        } else {
            foundingDate = date
        }
        let updateDate = formatDate(now)
    
        let record = {
            contractId: contractId,
            summoner: state.accountId,
            date: foundingDate,
            category: category,
            name: name,
            logo: logo,
            purpose: draftToHtml(convertToRaw(purpose.getCurrentContent())),
            discordActivation: discordActivated,
            proposalActivation: proposalsActivated,
            passedProposalActivation: passedProposalsActivated,
            sponsorActivation: sponsorActivated,
            skills: skills,
            specificSkills: specificSkills,
            country: country,
            language: language,
            discord: discord,
            twitter: twitter,
            telegram: telegram, 
            email: email,
            website: website, 
            reddit: reddit,
            platform: platform,
            likes: currentLikes,
            dislikes: currentDisLikes,
            neutrals: currentNeutrals,
            lastUpdated: updateDate
        }

         //ADD WEBHOOK HERE
         let hookArray = await ceramic.downloadKeysSecret(curUserIdx, 'apiKeys')
   
         // let hookArray = []
         hookArray = [
           {
           api: webhook, 
           discordActivation: discordActivated,
           proposalActivation: proposalsActivated,
           passedProposalActivation: passedProposalsActivated, 
           sponsorActivation: sponsorActivated
           }
         ]
 
         
 
        try {
            let result2 = await ceramic.storeKeysSecret(curUserIdx, hookArray, 'apiKeys', curUserIdx.id)
            let result = await curUserIdx.set('daoProfile', record)
            setFinished(true)
            update('', { isUpdated: !isUpdated })
            window.location.assign('/')
            setOpen(false)
            handleClose()
          } catch (err) {
            console.log('error updating profile', err)
            setFinished(true)
            update('', { isUpdated: !isUpdated })
            setOpen(false)
            handleClose()
          }
    }

        return (
           
            <div>
       
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            { loaded ? (<>
              <DialogTitle id="form-dialog-title">Guild Profile Details</DialogTitle>
              <DialogContent>
                  <DialogContentText style={{marginBottom: 10}}>
                  Provide as much detail as you'd like.
                  </DialogContentText>
                  <Paper style={{padding: '5px', marginBottom: '15px'}}>
                    <Grid container spacing={1} style={{marginBottom: '5px'}}>
                        <Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
                        <div style={{width: '100%', 
                            height: '50px',
                            backgroundImage: `url(${logo})`, 
                            backgroundSize: 'contain',
                            backgroundPosition: 'center', 
                            backgroundRepeat: 'no-repeat',
                            backgroundOrigin: 'content-box'
                        }}></div>
                        <Avatar
                        alt={accountId}
                        src={logo}
                        style={{display:'none'}}
                        imgProps={{
                          onLoad:(e) => { handleAvatarLoaded(true) }
                        }}  
                      />
                            {progress ?
                            <CircularProgress />
                            : null }
                        </Grid>
                        <Grid item xs={12} sm={12} md={10} lg={10} xl={10}>
                            <FileUpload handleFileHash={handleFileHash} handleAvatarLoaded={handleAvatarLoaded}/>
                        </Grid>
                    </Grid>
                </Paper>
                <Grid container spacing={1} style={{marginBottom: '5px'}}>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                      <TextField
                        autoFocus
                        margin="dense"
                        id="profile-name"
                        variant="outlined"
                        name="name"
                        label="Guild Name"
                        placeholder="Super Guild"
                        value={name}
                        onChange={handleNameChange}
                        inputRef={register({
                            required: false                              
                        })}
                      />
                    {errors.name && <p style={{color: 'red'}}>You must provide a guild name.</p>}
                    </Grid>

                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <TextField
                        margin="dense"
                        id="profile-category"
                        variant="outlined"
                        name="category"
                        label="Category"
                        placeholder="Social Cause"
                        value={category}
                        onChange={handleCategoryChange}
                        inputRef={register({
                            required: false                              
                        })}
                        />
                        {errors.name && <p style={{color: 'red'}}>You must categorize your guild so others can find it.</p>}
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
                            <FormHelperText>Select the languages your guild works with.</FormHelperText>
                        </FormControl>
                    </Grid>
                </Grid>
                <Typography variant="h6" style={{marginTop: '15px'}}>Purpose</Typography>
                <Paper style={{padding: '5px'}}>
                    <Editor
                    editorState={purpose}
                    toolbarClassName="toolbar-class"
                    wrapperClassName="wrapper-class"
                    editorClassName="editor-class"
                    toolbar={{
                        inline: { inDropdown: true },
                        list: { inDropdown: true },
                        textAlign: { inDropdown: true },
                        link: { inDropdown: true },
                        image: { inDropdown: true },
                        history: { inDropdown: true },
                      }}
                    onEditorStateChange={handlePurposeChange}
                    editorStyle={{minHeight:'200px'}}
                    />
                </Paper>
                <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                    >
                    <Typography variant="h6">Guild Accounts</Typography>
                    <Tooltip TransitionComponent={Zoom} title="Here you can add communication channels for your guild.">
                    <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                    </Tooltip>
                    </AccordionSummary>
                <AccordionDetails>
                <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                    <TextField
                    
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
                    
                    margin="dense"
                    id="daoprofile-website"
                    variant="outlined"
                    name="website"
                    label="Website"
                    placeholder="www.someplace.com"
                    value={website}
                    onChange={handleWebsiteChange}
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            https://
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
                    
                    margin="dense"
                    id="profile-discord"
                    variant="outlined"
                    name="discord"
                    label="Discord Invite Link"
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
                    
                    margin="dense"
                    id="profile-telegram"
                    variant="outlined"
                    name="telegram"
                    label="Telegram Channel Link"
                    placeholder="someplace"
                    value={telegram}
                    onChange={handleTelegramChange}
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <TelegramIcon />
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
                    
                    margin="dense"
                    id="profile-reddit"
                    variant="outlined"
                    name="reddit"
                    label="Reddit Username"
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
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                    <TextField
                    
                    margin="dense"
                    id="daoprofile-platform"
                    variant="outlined"
                    name="dao"
                    label="DAO"
                    placeholder="link to DAO"
                    value={platform}
                    onChange={handlePlatformChange}
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            https://
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
                    
                    margin="dense"
                    id="daoprofile-contract"
                    variant="outlined"
                    name="contract"
                    label="NEAR Contract Account"
                    placeholder="somecontract.near"
                    value={contractId}
                    onChange={handleContractIdChange}
                    inputRef={register({
                        required: false                              
                    })}
                    />
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
                    <Typography variant="h6">Guild Values</Typography>
                    <Tooltip TransitionComponent={Zoom} title="Here you can add the values and general skills (leadership, management, teamwork, etc...) that your guild is centered around.">
                    <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                    </Tooltip>
                    </AccordionSummary>
                <AccordionDetails>
                <React.Fragment>
                    <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                    {
                    skillsFields.map((field, index) => {
                    return(
                        
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                        <TextField
                        
                        margin="dense"
                        id={`skills[${index}].name`}
                        variant="outlined"
                        name={`skills[${index}].name`}
                        defaultValue={field.name}
                        label="Value:"
                        InputProps={{
                            endAdornment: <div>
                            <Tooltip TransitionComponent={Zoom} title="Name of value.">
                                <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                            </Tooltip>
                            </div>
                        }}
                        inputRef={register({
                            required: true                              
                        })}
                        />
                        {errors[`skills${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a value name.</p>}
                        
                        <Button type="button" onClick={() => skillsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                        <DeleteForeverIcon />
                        </Button>
                        </Grid>
                        
                    )
                    }) 
                    }
                    {!skillsFields || skillsFields.length == 0 ?
                    <Typography variant="body1" style={{marginLeft: '5px'}}>No values defined yet. Add values that are relevant to your guild.</Typography>
                    : null }
                    <Button
                    type="button"
                    onClick={() => skillsAppend({name: ''})}
                    startIcon={<AddBoxIcon />}
                    >
                    Add Value
                    </Button>
                </Grid>
                </React.Fragment>  
            </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                    >
                    <Typography variant="h6">Desirable Skills and Competencies</Typography>
                    <Tooltip TransitionComponent={Zoom} title="Here you can add specific skills such as programming languages, frameworks, certifications, etc... that are relevant to what your guild does.">
                    <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                    </Tooltip>
                    </AccordionSummary>
                <AccordionDetails>
                <React.Fragment>
                    <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                    {
                    specificSkillsFields.map((field, index) => {
                    return(
                        
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                        <TextField
                        
                        margin="dense"
                        id={`specificSkills[${index}].name`}
                        variant="outlined"
                        name={`specificSkills[${index}].name`}
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
                        {errors[`specificSkills${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a skill name.</p>}
                        
                        <Button type="button" onClick={() => specificSkillsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                        <DeleteForeverIcon />
                        </Button>
                        </Grid>
                        
                    )
                    }) 
                    }
                    {!specificSkillsFields || specificSkillsFields.length == 0 ?
                    <Typography variant="body1" style={{marginLeft: '5px'}}>No specific skills defined yet. Add specific skills that are relevant to your guild.</Typography>
                    : null }
                    <Button
                    type="button"
                    onClick={() => specificSkillsAppend({name: ''})}
                    startIcon={<AddBoxIcon />}
                    >
                    Add Skill
                    </Button>
                </Grid>
                </React.Fragment>  
            </AccordionDetails>
                </Accordion>
                {platform.substr(0,8).toLowerCase() == 'cdao.app' ?
                    <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                    <Typography variant="h6">Notifications</Typography>
                    <Tooltip TransitionComponent={Zoom} title="Here you can setup Discord notifications for your guild.">
                        <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                    </Tooltip>
                </AccordionSummary>
                <AccordionDetails>
                <Grid container justifyContent="flex-start" alignItems="center" spacing={1}>
                    <Grid item xs={12} sm={12} md={9} lg={9} xl={9}>
                    <TextField
                        fullWidth
                        margin="dense"
                        id="discord-webhook"
                        variant="outlined"
                        name="WebHook"
                        label="Discord Server Webhook"
                        placeholder="Discord Server Webhook"
                        value={webhook}
                        onChange={handleWebhookChange}
                        inputRef={register({
                            required: false                              
                        })}
                    />
                    </Grid>
                    <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                    <FormControlLabel control={<Switch checked={discordActivated} onChange={handleDiscordActivation} color="primary"/>} label="Enabled" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Typography variant="h6">Notify on:</Typography>
                    </Grid>
                    <Grid item xs={6} sm={6} md={4} lg={4} xl={4}>
                    <FormControlLabel control={<Switch checked={proposalsActivated} onChange={handleProposalActivation} color="primary"/>} label="New Proposal" />
                    </Grid>
                    <Grid item xs={6} sm={6} md={4} lg={4} xl={4}>
                    <FormControlLabel control={<Switch checked={passedProposalsActivated} onChange={handlePassedProposalActivation} color="primary"/>} label="Processed Proposal" />
                    </Grid>
                    <Grid item xs={6} sm={6} md={4} lg={4} xl={4}>
                    <FormControlLabel control={<Switch checked={sponsorActivated} onChange={handleSponsorActivation} color="primary"/>} label="Sponsored Proposal" />
                    </Grid>
                </Grid>
                </AccordionDetails>
                </Accordion>
                : null }
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
                <Typography variant="h5" align="center">Loading Guild Details</Typography>
              </Grid>
              </Grid>
              </div></> }
            </Dialog>
           
          </div>
        
        )
}