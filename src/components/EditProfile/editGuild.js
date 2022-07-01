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
    waiting: {
      minWidth: '100%',
      minHeight: '100%',
      overflow: 'hidden',
      padding: '20px'
    }
    }));

const logoName = require('../../img/default_logo.png') // default no-image avatar
const discordIcon = require('../../img/discord-icon.png')

export default function EditGuildProfileForm(props) {
    const [open, setOpen] = useState(true)
    const [finished, setFinished] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [date, setDate] = useState('')
    const [name, setName] = useState('')
    const [curDaoIdx, setCurDaoIdx] = useState()
    const [logo, setLogo] = useState('')
    const [pfpLogo, setPfpLogo] = useState('')
    const [purpose, setPurpose] = useState(EditorState.createEmpty())
    const [category, setCategory] = useState('')
    const [webhook, setWebhook] = useState('')
    const [country, setCountry] = useState('')
    const [language, setLanguage] = useState([])
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
    const [nftContract, setNftContract] = useState('')
    const [nftTokenId, setNftTokenId] = useState('')

    const [pfpLogoLoaded, setPfpLogoLoaded] = useState(true)
    const [pfpProgress, setPfpProgress] = useState(false)
    
    const [currentLikes, setCurrentLikes] = useState([])
    const [currentDisLikes, setCurrentDisLikes] = useState([])
    const [currentNeutrals, setCurrentNeutrals] = useState([])

    const countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
    const languages = ['Abkhazian','Afar','Afrikaans','Akan','Albanian','Amharic','Arabic','Aragonese','Armenian','Assamese','Avaric','Avestan','Aymara','Azerbaijani','Bambara','Bashkir','Basque','Belarusian','Bengali','Bihari languages','Bislama','Bosnian','Breton','Bulgarian','Burmese','Catalan, Valencian','Central Khmer','Chamorro','Chechen','Chichewa, Chewa, Nyanja','Chinese','Church Slavonic, Old Bulgarian, Old Church Slavonic','Chuvash','Cornish','Corsican','Cree','Croatian','Czech','Danish','Divehi, Dhivehi, Maldivian','Dutch, Flemish','Dzongkha','English','Esperanto','Estonian','Ewe','Faroese','Fijian','Finnish','French','Fulah','Gaelic, Scottish Gaelic','Galician','Ganda', 'Georgian','German','Gikuyu, Kikuyu','Greek (Modern)','Greenlandic, Kalaallisut','Guarani','Gujarati','Haitian, Haitian Creole','Hausa','Hebrew','Herero','Hindi','Hiri Motu','Hungarian','Icelandic','Ido','Igbo','Indonesian','Interlingua (International Auxiliary Language Association)','Interlingue','Inuktitut','Inupiaq','Irish','Italian','Japanese','Javanese','Kannada','Kanuri','Kashmiri','Kazakh','Kinyarwanda','Komi','Kongo','Korean','Kwanyama, Kuanyama','Kurdish','Kyrgyz','Lao','Latin','Latvian','Letzeburgesch, Luxembourgish','Limburgish, Limburgan, Limburger','Lingala','Lithuanian','Luba-Katanga','Macedonian','Malagasy','Malay','Malayalam','Maltese','Manx','Maori','Marathi','Marshallese','Moldovan, Moldavian, Romanian','Mongolian','Nauru','Navajo, Navaho','Northern Ndebele','Ndonga','Nepali','Northern Sami','Norwegian','Norwegian Bokmål','Norwegian Nynorsk','Nuosu, Sichuan Yi','Occitan (post 1500)','Ojibwa','Oriya','Oromo','Ossetian, Ossetic','Pali','Panjabi, Punjabi','Pashto, Pushto','Persian','Polish','Portuguese','Quechua','Romansh','Rundi','Russian','Samoan','Sango','Sanskrit','Sardinian','Serbian','Shona','Sindhi','Sinhala, Sinhalese','Slovak','Slovenian','Somali','Sotho, Southern','South Ndebele','Spanish, Castilian','Sundanese','Swahili','Swati','Swedish','Tagalog','Tahitian','Tajik','Tamil','Tatar','Telugu','Thai','Tibetan','Tigrinya','Tonga (Tonga Islands)','Tsonga','Tswana','Turkish','Turkmen','Twi','Uighur, Uyghur','Ukrainian','Urdu','Uzbek','Venda','Vietnamese','Volap_k','Walloon','Welsh','Western Frisian','Wolof','Xhosa','Yiddish','Yoruba','Zhuang, Chuang','Zulu' ]
   
    const daoPlatforms = ['Catalyst', 'Astro']
    const [platform, setPlatform] = useState('')
    const [daoContractId, setDaoContractId] = useState('')
    const [avatarLoaded, setAvatarLoaded] = useState(true)

    const [progress, setProgress] = useState(false)

    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()
    const categories = ["Production","Social","Educational","Community","Research","Gaming","Other"];
    
    const { 
        fields: guildValuesFields,
        append: guildValuesAppend,
        remove: guildValuesRemove } = useFieldArray({
        name: "guildValues",
        control
      })
    
    const { 
        fields: guildTeachFields,
        append: guildTeachAppend,
        remove: guildTeachRemove } = useFieldArray({
    name: "guildTeach",
    control
    })

    const { 
        fields: guildFocusFields,
        append: guildFocusAppend,
        remove: guildFocusRemove } = useFieldArray({
    name: "guildFocus",
    control
    })

    const { 
        fields: guildProjectsFields,
        append: guildProjectsAppend,
        remove: guildProjectsRemove } = useFieldArray({
    name: "guildProjects",
    control
    })

    const {
       fields: guildGeneralSkillsFields,
       append: guildGeneralSkillsAppend,
       remove: guildGeneralSkillsRemove} = useFieldArray({
      name: "guildGeneralSkills",
      control
    })

    const { 
      fields: guildSpecificSkillsFields,
      append: guildSpecificSkillsAppend,
      remove: guildSpecificSkillsRemove } = useFieldArray({
      name: "guildSpecificSkills",
      control
    })

    const { 
        fields: guildServicesFields,
        append: guildServicesAppend,
        remove: guildServicesRemove } = useFieldArray({
        name: "guildServices",
        control
      })

    const {
      fields: personaValidatorFields,
      append: personaValidatorAppend,
      remove: personaValidatorRemove} = useFieldArray({
      name: "personaValidators",
      control
    })

    const guildValues = watch('guildValues', guildValuesFields)
    const guildTeach = watch('guildTeach', guildTeachFields)
    const guildFocus = watch('guildFocus', guildFocusFields)
    const guildServices = watch('guildServices', guildServicesFields)
    const guildProjects = watch('guildProjects', guildProjectsFields)
    const guildGeneralSkills = watch('guildGeneralSkills', guildGeneralSkillsFields)
    const guildSpecificSkills = watch('guildSpecificSkills', guildSpecificSkillsFields)
    const personaValidators = watch('personaValidators', personaValidatorFields)
  
    const { state, dispatch, update } = useContext(appStore)

    const {
        handleEditGuildClickState,
        curUserIdx,
        accountId,
        did
    } = props

    const {
      appIdx,
      isUpdated,
      account
    } = state
    
    const classes = useStyles()

    useEffect(() => {
        if(logo != logoName && avatarLoaded){
          setProgress(false)
        }
        if(logo != logoName && !avatarLoaded){
          setProgress(true)
        }
      }, [logo, avatarLoaded]
      )

      useEffect(() => {
        if(pfpLogo != logoName && pfpLogoLoaded){
          setPfpProgress(false)
        }
        if(pfpLogo != logoName && !pfpLogoLoaded){
          setPfpProgress(true)
        }
      }, [pfpLogo, pfpLogoLoaded]
      )
  
    useEffect(() => {
      async function fetchNftData() {
        if(nftContract && nftTokenId && near){
          let data = await account.viewFunction(nftContract, 'nft_token', { token_id: nftTokenId })
          if(data.metadata.media.length == 46 && data.metadata.media.substr(0,2) == "Qm"){
            setPfpLogo(`${IPFS_PROVIDER}/${data.metadata.media}`)
          }
          if(data.metadata.media.length == 59 && data.metadata.media.substr(0,4) == "bafy"){
            setPfpLogo(`${IPFS_PROVIDER}/${data.metadata.media}`)
          }
          if(data.metadata.media.substr(0,4) == "http"){
            setPfpLogo(data.metadata.media)
          }
        }
      }
      

      fetchNftData()
      .then((res) => {

      })

    }, [nftContract, nftTokenId])
   
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

                let result = await appIdx.get('guildProfile', did)
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
                result.logo ? setLogo(result.logo) : setLogo(logoName)
                result.skills ? setValue('guildGeneralSkills', result.skills) : null
                result.specificSkills ? setValue('guildSpecificSkills', result.specificSkills) : null
                result.teach ? setValue('guildTeach', result.teach) : null
                result.focus ? setValue('guildFocus', result.focus) : null
                result.projects ? setValue('guildProjects', result.projects) : null
                result.values ? setValue('guildValues', result.values) : null
                result.services ? setValue('guildServices', result.services) : null
                result.category ? setCategory(result.category) : setCategory('')
                result.discordActivation ? setDiscordActivated(true) : setDiscordActivated(false)
                result.proposalActivation ? setProposalsActivated(true) : setProposalsActivated(false)
                result.passedProposalActivation ? setPassedProposalsActivated(true) : setPassedProposalsActivated(false)
                result.sponsorActivation ? setSponsorActivated(true) : setSponsorActivated(false)
                result.validators && result.validators.length > 0 ? setValue('personaValidators', result.validators) : null
                result.reddit? setReddit(result.reddit) : setReddit('')
                result.discord? setDiscord(result.discord): setDiscord('')
                result.twitter? setTwitter(result.twitter): setTwitter('')
                result.email? setEmail(result.email): setEmail('')
                result.telegram? setTelegram(result.telegram): setTelegram('')
                result.website? setWebsite(result.website): setWebsite('')
                result.country ? setCountry(result.country): setCountry('')
                result.language ? setLanguage(result.language): setLanguage([])
                result.platform ? setPlatform(result.platform) : setPlatform('')
                result.contractId ? setDaoContractId(result.contractId) : setDaoContractId('')
                result.likes ? setCurrentLikes(result.likes) : setCurrentLikes([])
                result.dislikes ? setCurrentDisLikes(result.dislikes) : setCurrentDisLikes([])
                result.neutrals ? setCurrentNeutrals(result.neutrals) : setCurrentNeutrals([])  
                result.nftContract ? setNftContract(result.nftContract) : setNftContract('')
                result.nftTokenId ? setNftTokenId(result.nftTokenId) : setNftTokenId('')
                result.profileNft ? setPfpLogo(result.profileNft) : setPfpLogo(logoName)
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

    
    function handlePfpLogoLoaded(property){
      setPfpLogoLoaded(property)
    }

    const handleNameChange = (event) => {
        let value = event.target.value;
        setName(value)
    }

    const handleDaoContractIdChange = (event) => {
      let value = event.target.value;
      setDaoContractId(value)
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

    const handleNftContractChange = (event) => {
      let value = event.target.value
      setNftContract(value)
    }

    const handleNftTokenIdChange = (event) => {
      let value = event.target.value
      setNftTokenId(value)
    }

    const handlePlatformChange = (event) => {
      let value = event.target.value
      setPlatform(value)
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
            summoner: state.accountId,
            date: foundingDate,
            category: category,
            name: name,
            logo: pfpLogo != logoName ? '' : logo,
            purpose: draftToHtml(convertToRaw(purpose.getCurrentContent())),
            discordActivation: discordActivated,
            proposalActivation: proposalsActivated,
            passedProposalActivation: passedProposalsActivated,
            sponsorActivation: sponsorActivated,
            skills: guildGeneralSkills,
            specificSkills: guildSpecificSkills,
            teach: guildTeach,
            focus: guildFocus,
            projects: guildProjects,
            values: guildValues,
            services: guildServices,
            country: country,
            language: language,
            discord: discord,
            twitter: twitter,
            telegram: telegram, 
            email: email,
            website: website, 
            reddit: reddit,
            platform: platform,
            contractId: daoContractId,
            likes: currentLikes,
            dislikes: currentDisLikes,
            neutrals: currentNeutrals,
            lastUpdated: updateDate,
            nftContract: nftContract,
            nftTokenId: nftTokenId,
            profileNft: logo != logoName ? '' : pfpLogo,
            validators: personaValidators
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
            let result = await curUserIdx.set('guildProfile', record)
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
                  <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                      >
                        <Typography variant="h6">Upload a Logo</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2} style={{marginBottom: '5px'}}>
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <div style={{width: '100%', 
                            height: '50px',
                            backgroundImage: `url(${logo})`, 
                            backgroundSize: 'contain',
                            backgroundPosition: 'center', 
                            backgroundRepeat: 'no-repeat',
                            backgroundOrigin: 'content-box'
                          }}></div>
                          </Grid>
                          <Grid item xs={10} sm={10} md={10} lg={10} xl={10}>
                            <FileUpload handleFileHash={handleFileHash} handleAvatarLoaded={handleAvatarLoaded}/>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                  </Accordion>
                  <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header"
                      >
                        <Typography variant="h6">Specify NFT Avatar</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2} style={{marginBottom: '5px'}}>
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                          <div style={{width: '100%', 
                            height: '50px',
                            backgroundImage: `url(${pfpLogo})`, 
                            backgroundSize: 'contain',
                            backgroundPosition: 'center', 
                            backgroundRepeat: 'no-repeat',
                            backgroundOrigin: 'content-box'
                          }}></div>
                           
                          </Grid>
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <TextField
                              autoFocus
                              margin="dense"
                              id="profile-nftcontract"
                              variant="outlined"
                              name="nftContract"
                              label="NFT Contract"
                              placeholder="x.paras.near"
                              value={nftContract}
                              onChange={handleNftContractChange}
                              inputRef={register({
                                  required: false                              
                              })}
                            />
                          </Grid>
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <TextField
                              autoFocus
                              margin="dense"
                              id="profile-nftcontract"
                              variant="outlined"
                              name="nftTokenId"
                              label="Token Id"
                              value={nftTokenId}
                              onChange={handleNftTokenIdChange}
                              inputRef={register({
                                  required: false                              
                              })}
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                  </Accordion>
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
                      <FormControl className={classes.input}>
                          <InputLabel id="country-label">Classification</InputLabel>
                          <Select
                          className={classes.input}
                          required
                          label = "Classification"
                          id = "profile-classification"
                          value = {category}
                          onChange = {handleCategoryChange}
                          input={<Input />}
                          >
                          {categories.map((category) => (
                              <MenuItem key={category} value={category}>
                              {category}
                              </MenuItem>
                          ))}
                          </Select>
                      </FormControl>
                      {errors.name && <p style={{color: 'red'}}>You must classify your guild so others can find it.</p>}
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
                    id="guildprofile-website"
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
                <FormControl>
                <InputLabel id="language-label">DAO/Community Platform</InputLabel>
                  <Select
                      className={classes.input}
                      label = "DAO Platform"
                      id = "profile-platform"
                      value = {platform}
                      onChange = {handlePlatformChange}
                      input={<Input />}
                      >
                      {daoPlatforms.map((platform) => (
                          <MenuItem key={platform} value={platform}>
                          {platform}
                          </MenuItem>
                      ))}
                      </Select>
                      <FormHelperText>Select the DAO/Community platform your guild works with.</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                    <TextField
                    margin="dense"
                    id="guildprofile-daoContractId"
                    variant="outlined"
                    name="daoContractId"
                    label="DAO/Community Contract Name"
                    placeholder="yourcommunity.cdao.near"
                    value={daoContractId}
                    onChange={handleDaoContractIdChange}
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
                    <Tooltip TransitionComponent={Zoom} title="Here you can add the values your guild is centered around.">
                    <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                    </Tooltip>
                    </AccordionSummary>
                <AccordionDetails>
                <React.Fragment>
                    <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                    {
                    guildValuesFields.map((field, index) => {
                    return(
                        
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                        <TextField
                        
                        margin="dense"
                        id={`guildValues[${index}].name`}
                        variant="outlined"
                        name={`guildValues[${index}].name`}
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
                        {errors[`guildValues${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a value name.</p>}
                        
                        <Button type="button" onClick={() => guildValuesRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                        <DeleteForeverIcon />
                        </Button>
                        </Grid>
                        
                    )
                    }) 
                    }
                    {!guildValuesFields || guildValuesFields.length == 0 ?
                    <Typography variant="body1" style={{marginLeft: '5px'}}>No values defined yet. Add values that are relevant to your guild.</Typography>
                    : null }
                    <Button
                    type="button"
                    onClick={() => guildValuesAppend({name: ''})}
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
                    <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  
                      
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                      <Typography variant="body1" style={{fontSize: 'large', fontWeight:'400', marginTop: '10px', marginBottom:'10px'}}>General Skills Desired</Typography>
                      {
                        guildGeneralSkillsFields.map((field, index) => {
                        
                        return(
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                          <TextField
                            
                            margin="dense"
                            id={`guildGeneralSkills[${index}].name`}
                            variant="outlined"
                            name={`guildGeneralSkills[${index}].name`}
                            defaultValue={field.name}
                            label="Interests:"
                            InputProps={{
                              endAdornment: <div>
                              <Tooltip TransitionComponent={Zoom} title="Short name of skill name.">
                                  <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                              </Tooltip>
                              </div>
                            }}
                            inputRef={register({
                                required: true                              
                            })}
                          />
                          {errors[`guildGeneralSkills${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a skill name.</p>}
                          
                          <Button type="button" onClick={() => guildGeneralSkillsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                            <DeleteForeverIcon />
                          </Button>
                          </Grid>
                          
                        )
                      }) 
                      }
                      {!guildGeneralSkillsFields || guildGeneralSkillsFields.length == 0 ?
                        <Typography variant="body1" style={{marginLeft: '5px'}}>No skills defined yet.</Typography>
                      : null }
                        <Button
                          type="button"
                          onClick={() => guildGeneralSkillsAppend({name: ''})}
                          startIcon={<AddBoxIcon />}
                        >
                          Add General Skill
                        </Button>
                      </Grid>
                    </Grid>
                    <Divider variant="middle" style={{marginTop: '15px', marginBottom: '15px'}}/>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                        <Typography variant="body1" style={{fontSize: 'large', fontWeight:'400', marginTop: '10px', marginBottom:'10px'}}>Specific Skills Desired</Typography>
                        {
                        guildSpecificSkillsFields.map((field, index) => {
                        
                        return(
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                            <TextField
                            
                            margin="dense"
                            id={`guildSpecificSkills[${index}].name`}
                            variant="outlined"
                            name={`guildSpecificSkills[${index}].name`}
                            defaultValue={field.name}
                            label="Services:"
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
                            {errors[`guildSpecificSkills${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a skill name.</p>}
                            
                            <Button type="button" onClick={() => guildSpecificSkillsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                            <DeleteForeverIcon />
                            </Button>
                            </Grid>
                            
                        )
                        }) 
                        }
                        {!guildSpecificSkillsFields || guildSpecificSkillsFields.length == 0 ?
                        <Typography variant="body1" style={{marginLeft: '5px'}}>No specific skills defined yet.</Typography>
                        : null }
                        <Button
                            type="button"
                            onClick={() => guildSpecificSkillsAppend({name: ''})}
                            startIcon={<AddBoxIcon />}
                        >
                            Add Specific Skill
                        </Button>
                        </Grid>
                    </Grid>
                    
                </Grid>
                </Grid>
                </AccordionDetails>
                </Accordion>
                <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel7bh-content"
                  id="panel7bh-header"
                >
                <Typography variant="h6">Guild Offerings</Typography>
                </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  
                      
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                      <Typography variant="body1" style={{fontSize: 'large', fontWeight:'400', marginTop: '10px', marginBottom:'10px'}}>Focus Areas</Typography>
                      {
                        guildFocusFields.map((field, index) => {
                        
                        return(
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                          <TextField
                            
                            margin="dense"
                            id={`guildFocus[${index}].name`}
                            variant="outlined"
                            name={`guildFocus[${index}].name`}
                            defaultValue={field.name}
                            label="Interests:"
                            InputProps={{
                              endAdornment: <div>
                              <Tooltip TransitionComponent={Zoom} title="Short name of focus area.">
                                  <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                              </Tooltip>
                              </div>
                            }}
                            inputRef={register({
                                required: true                              
                            })}
                          />
                          {errors[`guildFocus${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a focus area name.</p>}
                          
                          <Button type="button" onClick={() => guildFocusRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                            <DeleteForeverIcon />
                          </Button>
                          </Grid>
                          
                        )
                      }) 
                      }
                      {!guildFocusFields || guildFocusFields.length == 0 ?
                        <Typography variant="body1" style={{marginLeft: '5px'}}>No focus areas defined yet.</Typography>
                      : null }
                        <Button
                          type="button"
                          onClick={() => guildFocusAppend({name: ''})}
                          startIcon={<AddBoxIcon />}
                        >
                          Add Focus Area
                        </Button>
                      </Grid>
                    </Grid>
                    <Divider variant="middle" style={{marginTop: '15px', marginBottom: '15px'}}/>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                        <Typography variant="body1" style={{fontSize: 'large', fontWeight:'400', marginTop: '10px', marginBottom:'10px'}}>Services</Typography>
                        {
                        guildServicesFields.map((field, index) => {
                        
                        return(
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                            <TextField
                            
                            margin="dense"
                            id={`guildServices[${index}].name`}
                            variant="outlined"
                            name={`guildServices[${index}].name`}
                            defaultValue={field.name}
                            label="Services:"
                            InputProps={{
                                endAdornment: <div>
                                <Tooltip TransitionComponent={Zoom} title="Short name of service.">
                                    <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                                </Tooltip>
                                </div>
                            }}
                            inputRef={register({
                                required: true                              
                            })}
                            />
                            {errors[`guildServices${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a service name.</p>}
                            
                            <Button type="button" onClick={() => guildServicesRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                            <DeleteForeverIcon />
                            </Button>
                            </Grid>
                            
                        )
                        }) 
                        }
                        {!guildServicesFields || guildServicesFields.length == 0 ?
                        <Typography variant="body1" style={{marginLeft: '5px'}}>No services defined yet. Add them to make it easier for people to get help with what they need.</Typography>
                        : null }
                        <Button
                            type="button"
                            onClick={() => guildServicesAppend({name: ''})}
                            startIcon={<AddBoxIcon />}
                        >
                            Add Service
                        </Button>
                        </Grid>
                    </Grid>
                    <Divider variant="middle" style={{marginTop: '15px', marginBottom: '15px'}}/>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                      <Typography variant="body1" style={{fontSize: 'large', fontWeight:'400', marginTop: '10px', marginBottom:'10px'}}>Subjects Taught</Typography>
                      {
                        guildTeachFields.map((field, index) => {
                        return(
                          
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                          <TextField
                            
                            margin="dense"
                            id={`guildTeach[${index}].name`}
                            variant="outlined"
                            name={`guildTeach[${index}].name`}
                            defaultValue={field.name}
                            label="Subject:"
                            InputProps={{
                              endAdornment: <div>
                              <Tooltip TransitionComponent={Zoom} title="Short name of skill taught.">
                                  <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                              </Tooltip>
                              </div>
                            }}
                            inputRef={register({
                                required: true                              
                            })}
                          />
                          {errors[`guildTeach${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a subject name taught.</p>}
                          
                          <Button type="button" onClick={() => guildTeachRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                            <DeleteForeverIcon />
                          </Button>
                          </Grid>
                          
                        )
                      }) 
                      }
                      {!guildTeachFields || guildTeachFields.length == 0 ?
                        <Typography variant="body1" style={{marginLeft: '5px'}}>No teaching subjects defined yet.</Typography>
                      : null }
                        <Button
                          type="button"
                          onClick={() => guildTeachAppend({name: ''})}
                          startIcon={<AddBoxIcon />}
                        >
                          Add Subject
                        </Button>
                      </Grid>
                    </Grid>
                    <Divider variant="middle" style={{marginTop: '15px', marginBottom: '15px'}}/>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                      <Typography variant="body1" style={{fontSize: 'large', fontWeight:'400', marginTop: '10px', marginBottom:'10px'}}>Current Projects</Typography>
                      {
                        guildProjectsFields.map((field, index) => {
                        return(
                          
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                          <TextField
                            
                            margin="dense"
                            id={`guildProjects[${index}].name`}
                            variant="outlined"
                            name={`guildProjects[${index}].name`}
                            defaultValue={field.name}
                            label="Project:"
                            InputProps={{
                              endAdornment: <div>
                              <Tooltip TransitionComponent={Zoom} title="Short name of the project.">
                                  <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                              </Tooltip>
                              </div>
                            }}
                            inputRef={register({
                                required: true                              
                            })}
                          />
                          {errors[`guildProjects${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide the name of the project.</p>}
                          
                          <Button type="button" onClick={() => guildProjectsRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                            <DeleteForeverIcon />
                          </Button>
                          </Grid>
                          
                        )
                      }) 
                      }
                      {!guildProjectsFields || guildProjectsFields.length == 0 ?
                        <Typography variant="body1" style={{marginLeft: '5px'}}>No projects identified yet. Add them for better chance of finding people to work on them.</Typography>
                      : null }
                        <Button
                          type="button"
                          onClick={() => guildProjectsAppend({name: ''})}
                          startIcon={<AddBoxIcon />}
                        >
                          Add Project
                        </Button>
                      </Grid>
                    </Grid>              
                </Grid>
                </Grid>
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
                <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel5bh-content"
                  id="panel5bh-header"
                >
                <Typography variant="h6">Staking Validators</Typography>
                </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                  
                      
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Grid container justifyContent="space-between" alignItems="flex-end" spacing={1}>
                        <Typography variant="body1" style={{fontSize: 'large', fontWeight:'400', marginTop: '10px', marginBottom:'10px'}}>Validators</Typography>
                        {
                          personaValidatorFields.map((field, index) => {
                          
                          return(
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} key={field.id}>
                            <TextField
                              
                              margin="dense"
                              id={`personaValidators[${index}].name`}
                              variant="outlined"
                              name={`personaValidators[${index}].name`}
                              defaultValue={field.name}
                              label="Validators:"
                              InputProps={{
                                endAdornment: <div>
                                <Tooltip TransitionComponent={Zoom} title="Validator contract Id -eg. epic.poolv1.near">
                                    <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                                </Tooltip>
                                </div>
                              }}
                              inputRef={register({
                                  required: true                              
                              })}
                            />
                            {errors[`personaValidators${index}.name`] && <p style={{color: 'red', fontSize:'80%'}}>You must provide a validator contract name.</p>}
                            
                            <Button type="button" onClick={() => personaValidatorRemove(index)} style={{float: 'right', marginLeft:'10px'}}>
                              <DeleteForeverIcon />
                            </Button>
                            </Grid>
                            
                          )
                        }) 
                        }
                        {!personaValidatorFields || personaValidatorFields.length == 0 ?
                          <Typography variant="body1" style={{marginLeft: '5px'}}>No validators defined yet.</Typography>
                        : null }
                          <Button
                            type="button"
                            onClick={() => personaValidatorAppend({name: ''})}
                            startIcon={<AddBoxIcon />}
                          >
                            Add Validator
                          </Button>
                        </Grid>
                      </Grid>
                      </Grid>
                   </Grid>
                </AccordionDetails>
            </Accordion>
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