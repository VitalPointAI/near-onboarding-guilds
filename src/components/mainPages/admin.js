import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { get, set, del } from '../../utils/storage'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { GAS, 
  parseNearAmount, 
  didRegistryContractName, 
  fundingContractName,
  nameSuffix,
  getSendyAPI,
  formatNearAmount,
  networkId,
  MAIL_URL } from '../../state/near'
import { ceramic } from '../../utils/ceramic'
import AdminCard from '../Cards/AdminCard/adminCard'
import VerifierCard from '../Cards/VerifierCard/verifierCard'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js'
import { Editor } from "react-draft-wysiwyg"
import qs from 'qs'
import axios from 'axios'

// Material UI components
import { makeStyles } from '@mui/styles'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { TextField, Paper } from '@mui/material'
import { Typography, InputAdornment, Tooltip, Zoom, LinearProgress, Divider } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import SettingsIcon from '@mui/icons-material/Settings'
import List from '@mui/material/List'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  spacing: {
      marginTop: '15px',
      marginBottom: '15px'
  },
}));

  
export default function Admin(props) {

  const classes = useStyles()
  const { state, dispatch, update } = useContext(appStore)
  
  const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()
  
  const [allowance, setAllowance] = useState('')
  const [finished, setFinished] = useState(true)
  const [topupFinished, setTopupFinished] = useState(true)
  const [keyBalance, setKeyBalance] = useState(0)
  const [freeContract, setFreeContract] = useState()
  const [fundingAccountBalance, setFundingAccountBalance] = useState(0)
  const [topupAmount, setTopupAmount] = useState('')

  const [expanded, setExpanded] = useState(false)
  const [newAdminFinished, setNewAdminFinished] = useState(true)
  const [adminRegistered, setAdminRegistered] = useState(false)
  const [newAdmin, setNewAdmin] = useState('')

  const [newVerifierFinished, setNewVerifierFinished] = useState(true)
  const [verifierRegistered, setVerifierRegistered] = useState(false)
  const [verifier, setVerifier] = useState('')
  const [verified, setVerified] = useState(false)

  const [message, setMessage] = useState(EditorState.createEmpty())
  const [messageResult, setMessageResult] = useState('')
  const [messagePlainText, setMessagePlainText] = useState('')
  const [newMessageFinished, setNewMessageFinished] = useState(true)
  const [subject, setSubject] = useState('')

  const {
    fundingContract,
    didRegistryContract,
    factoryContract,
    contract,
    account,
    isUpdated,
    near,
    admins,
    currentVerifiers,
    app,
    wallet,
    isAdmin,
    accountId,
    appIdx
  } = state  

  useEffect(() => {
    let keyAmount
    async function fetchData() {
      if(isUpdated == true || isUpdated == false){}

      if(near){
        let accessKey
        let thisFreeContract = await ceramic.useFundingAccount(accountId)
        setFreeContract(thisFreeContract)
        console.log('thisfreecontract', thisFreeContract)
        let publicKey = "ed25519:" + thisFreeContract.pubKey
        try {
          accessKey = await near.connection.provider.query({
              request_type: "view_access_key",
              finality: "final",
              account_id: didRegistryContractName,
              public_key: publicKey
          })
          keyAmount = formatNearAmount(accessKey.permission.FunctionCall.allowance, 7)
          setKeyBalance(keyAmount)
          
          console.log('accesskey', accessKey)
         
        } catch (err) {
            console.log('problem retrieving access key', err)
        }

        let fundingAccount
        try {
          fundingAccount = await near.connection.provider.query({
              request_type: "view_account",
              finality: "final",
              account_id: fundingContractName,
          })
          let amount = formatNearAmount(fundingAccount.amount,3)
          console.log('amount', amount)
          setFundingAccountBalance(amount)
        } catch (err) {
            console.log('problem retrieving account', err)
        }
        console.log('funding account', fundingAccount)
      }
    }
   
    fetchData()
    .then((res) => {
      
    })

  }, [near, isUpdated])

  const handleAllowanceChange = (event) => {
    let value = event.target.value
    setAllowance(value)
  }

  const handleSubjectChange = (event) => {
    let value = event.target.value
    setSubject(value)
  }

  const handleMessageChange = (editorState) => {
    setMessage(editorState)
    setMessagePlainText(editorState.getCurrentContent().getPlainText())
  }

  const handleTopupChange = (event) => {
    let value = event.target.value
    setTopupAmount(value)
  }

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  }

  async function isRegistered(account, type) {
    let adminDid = await ceramic.getDid(account, factoryContract, didRegistryContract)
    adminDid && type == 'admin' ? setAdminRegistered(true) : null
    adminDid && type == 'verifier' ? setVerifierRegistered(true) : null
  }
  
  async function isVerified(account){
    try{
      let verificationStatus = await didRegistryContract.getVerificationStatus({accountId: account})
        if(verificationStatus != 'null'){
          setVerified(verificationStatus)
        }
      } catch (err) {
        console.log('error retrieving verification status', err)
      }
  }
  
  const adjustKeyAllowance = async (values) => {
    event.preventDefault()
    setFinished(false)
    
    try {
        await freeContract.contract.adjustKeyAllowance({
          fundingAccountPublicKey: freeContract.pubKey,
          newKeyAllowance: parseNearAmount(allowance)
        })
    } catch (err) {
      console.log('error adjusting key allowance', err)
    }
    update('', { isUpdated: !isUpdated })
    setAllowance('')
    setFinished(true)
  }

  const topup = async (values) => {
    event.preventDefault()
    setTopupFinished(false)
    
    try {
        await account.sendMoney(fundingContractName, parseNearAmount(topupAmount))
        setTopupFinished(true)
      } catch (err) {
        console.log('error topping up funding balance', err)
        setTopupFinished(true)
      }
      update('', { isUpdated: !isUpdated })
  }

  const newadmin = async (values) => {
    event.preventDefault()
    setNewAdminFinished(false)
    try {
        await didRegistryContract.addAdmin({
          accountId: newAdmin + nameSuffix
        })
      } catch (err) {
        console.log('error adding new admin', err)
      }
  }

  async function newverifier() {
    event.preventDefault()
    setNewVerifierFinished(false)
    try {
        await didRegistryContract.addVerifier({
          accountId: verifier + nameSuffix
        })
      } catch (err) {
        console.log('error adding new verifier', err)
      }
  }

  async function sendMessage() {
    setNewMessageFinished(false)

    let key = await getSendyAPI()
    let url = `${MAIL_URL}/api/campaigns/create.php`
    let title = subject + '|' + Date.now()
    
    let listId
    switch(true) {
      case process.env.ENV == 'test' || process.env.ENV == 'prod':
        listId = process.env.NG_SENDY_LIST_ID
      case process.env.ENV == 'localhost':
        listId = process.env.SENDY_LIST_ID
    }

    let brandId
    switch(true) {
      case process.env.ENV == 'test' || process.env.ENV == 'prod':
        brandId = process.env.NG_BRAND_ID
      case process.env.ENV == 'localhost':
        brandId = process.env.BRAND_ID
    }
   
  
    let data = {
        api_key: key.data.seed,
        from_name: 'NEAR Guilds',
        from_email: process.env.FROM_EMAIL,
        reply_to: process.env.REPLY_EMAIL,
        title: title,
        subject: subject,
        plain_text: messagePlainText,
        html_text: draftToHtml(convertToRaw(message.getCurrentContent())),
        list_ids: listId,
        brand_id: brandId,
        track_opens: 1,
        track_clicks: 1,
        send_campaign: 1
    }
  
    try{
      let axiosCall = await axios.post(url,
            qs.stringify(data),
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                }
            })
    console.log('axioscall', axiosCall)
    if(axiosCall.data == 'Campaign created and now sending'){
      let record = {
        adminId: accountId,
        subject: subject,
        message: draftToHtml(convertToRaw(message.getCurrentContent())),
        date: Date.now().toString()
      }

      await appIdx.set('announcements', record)
    }
    if(axiosCall){
      setMessageResult(axiosCall.data)
      setMessage(EditorState.createEmpty())
      setMessagePlainText('')
      setSubject('')
      setNewMessageFinished(true)
    }
    } catch (err) {
        console.log('error sending message', err)
    }
}

  
    return (<>
      {isAdmin ?
      <div style={{padding: '10px'}}>
      <Typography variant="h5" style={{padding:'10px', marginTop:'20px', marginBottom:'20px'}}><SettingsIcon /> Admin Settings</Typography>
      <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
         
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>
            Funding
          </Typography>
          <Typography sx={{ color: 'text.secondary', marginLeft: '10px' }}>Remaining Balance:<br></br> {fundingAccountBalance} Ⓝ</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={0} style={{padding: '20px', marginBottom: '5px', marginLeft: '0px'}} alignItems="center" justifyContent="space-evenly">
            <Grid item xs={9} sm={9} md={9} lg={9} xl={9} align="left">
              <TextField
                margin="dense"
                id="topup-id"
                variant="outlined"
                name="topupAmount"
                label="Top up"
                value={topupAmount}
                onChange={handleTopupChange}
                inputRef={register({
                    required: false                            
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="The amount of NEAR you want to add to the funding contract.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
              />
            {errors.topupAmount && <p style={{color: 'red'}}>You must provide an amount to send.</p>}
            </Grid>
            <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
              {topupFinished ?
                <Button onClick={topup} color="primary" variant="contained">
                  Send
                </Button>
              : <LinearProgress />
              }
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
         
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>
            Allowance
          </Typography>
          <Typography sx={{ color: 'text.secondary', marginLeft: '10px' }}>Remaining Allowance:<br></br> {keyBalance ? keyBalance : '0'} Ⓝ</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={0} style={{padding: '20px', marginBottom: '5px', marginLeft: '0px'}} alignItems="center" justifyContent="space-evenly">
            <Grid item xs={9} sm={9} md={9} lg={9} xl={9} align="left">
              <TextField
                margin="dense"
                id="allowance-id"
                variant="outlined"
                name="allowance"
                label="Allowance"
                value={allowance}
                onChange={handleAllowanceChange}
                inputRef={register({
                    required: false                            
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="The amount of NEAR you want the funding key to be able to spend on gas for registering and unregistering accounts.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
              />
            {errors.allowance && <p style={{color: 'red'}}>You must provide an allowance for the key.</p>}
            </Grid>
            <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
            {finished ?
              <Button onClick={adjustKeyAllowance} color="primary" variant="contained">
                Set
              </Button>
            : <LinearProgress />
            }
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
         
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>
            Manage Administrators
          </Typography>
          <Typography sx={{ color: 'text.secondary', marginLeft: '10px' }}> {admins ? admins.length : '0'} Admins</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={0} justifyContent="center" alignItems="center" style={{paddingLeft:'10px', paddingRight:'10px'}}>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {admins && admins.length > 0 ? 
                (<>
                {admins.map((accountId, i) => {
                    return ( 
                        <AdminCard
                            key={i}
                            personId={accountId}
                        />
                  )
                }
                )}
                </>)
              : null
              }
            </List>
          </Grid>
          <Grid container spacing={0} style={{padding: '10px', marginBottom: '5px', marginLeft: '0px'}} alignItems="center" justifyContent="space-evenly">
            <Grid item xs={9} sm={9} md={9} lg={9} xl={9} align="left">
              <TextField
                margin="dense"
                id="addAdmin-id"
                variant="outlined"
                name="newadmin"
                label="Add Admin"
                value={newAdmin}
                inputRef={register({
                  validate: {
                  exists: value => app.accountTaken,
                  registered: value => adminRegistered
                  }        
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">{nameSuffix}</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="Enter account name of user you want to make an admin.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase()
                  setNewAdmin(v)
                  wallet.isAccountTaken(v)
                  isRegistered(v + nameSuffix, 'admin')
                  isVerified(v + nameSuffix)
                }}
              />
            {errors.newadmin && <p style={{color: 'red'}}>You must provide a valid account name.</p>}
            </Grid>
            <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
              {newAdminFinished ?
                <Button onClick={newadmin} color="primary" variant="contained" style={{marginLeft: '3px'}}>
                  Add
                </Button>
              : <LinearProgress />
              }
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="left">
              {newAdmin != '' && (!app.accountTaken || !adminRegistered || !verified) ? <><Typography variant="overline">Not a valid admin account.</Typography><br></br></>: null}
            </Grid>  
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel4bh-content"
        id="panel2bh-header"
        
      >
        <Typography sx={{ width: '33%', flexShrink: 0 }}>
          Manage Verifiers
        </Typography>
        <Typography sx={{ color: 'text.secondary', marginLeft: '10px' }}> {currentVerifiers ? currentVerifiers.length : '0'} Verifiers</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={0} justifyContent="center" alignItems="center" style={{paddingLeft:'10px', paddingRight:'10px'}}>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {currentVerifiers && currentVerifiers.length > 0 ? 
              (<>
              {currentVerifiers.map((accountId, i) => {
                  return ( 
                      <VerifierCard
                          key={i}
                          personId={accountId}
                      />
                 )
              }
              )}
              </>)
            : null
            }
          </List>
        </Grid>
        <Grid container spacing={0} style={{padding: '10px', marginBottom: '5px', marginLeft: '0px'}} alignItems="center" justifyContent="space-evenly">
          <Grid item xs={9} sm={9} md={9} lg={9} xl={9} align="left">
            <TextField
              margin="dense"
              id="verifier-id"
              variant="outlined"
              name="verifier"
              label="Add Verifier"
              value={verifier}
              inputRef={register({
                validate: {
                exists: value => app.accountTaken,
                registered: value => verifierRegistered,
                verified: value => verified
                }        
              })}
              InputProps={{
                endAdornment: <><InputAdornment position="end">{nameSuffix}</InputAdornment>
                <Tooltip TransitionComponent={Zoom} title="Enter account name of user you want to make a verifier.">
                    <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                </Tooltip>
                </>
              }}
              onChange={(e) => {
                const v = e.target.value.toLowerCase()
                setVerifier(v)
                wallet.isAccountTaken(v)
                isRegistered(v + nameSuffix, 'verifier')
                isVerified(v + nameSuffix)
              }}
            />
          {errors.verifier && <p style={{color: 'red'}}>You must provide a valid and registered account name that is not already a verifier.</p>}        
          </Grid>
          <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
            {newVerifierFinished ?
              <Button onClick={newverifier} color="primary" variant="contained" style={{marginLeft: '3px'}}>
                Add
              </Button>
            : <LinearProgress />
            }
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="left">
            {verifier != '' && (!app.accountTaken || !verifierRegistered || !verified) ? <><Typography variant="overline">Not a valid verifier account.</Typography><br></br></>: null}
          </Grid> 
        </Grid>
      </AccordionDetails>
    </Accordion>
    <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel5bh-content"
        id="panel5bh-header"
        
      >
        <Typography sx={{ width: '33%', flexShrink: 0 }}>
          Message
        </Typography>
        <Typography sx={{ color: 'text.secondary', marginLeft: '10px' }}>Message all guilds</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={0} style={{padding: '10px', marginBottom: '5px', marginLeft: '0px'}} alignItems="center" justifyContent="space-evenly">
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="left">
            <Typography variant="h6" style={{marginTop: '15px'}}>Message</Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="left">
            <TextField
              margin="dense"
              id="subject-id"
              variant="outlined"
              name="subject"
              label="Message Subject"
              value={subject}              
              onChange={handleSubjectChange}
            />
            {errors.subject && <p style={{color: 'red'}}>You must provide a message subject.</p>}        
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="left">
            <Paper style={{padding: '5px'}}>
                  <Editor
                  editorState={message}
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
                  onEditorStateChange={handleMessageChange}
                  editorStyle={{minHeight:'200px'}}
                  />
              </Paper>
          </Grid>
          <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
            {newMessageFinished ?
               
              <Button onClick={sendMessage} color="primary" variant="contained" style={{marginLeft: '3px', marginTop: '10px'}}>
                Send
              </Button>
            : <LinearProgress />
            }
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="left">
            {messageResult != '' ?
            <Typography variant="overline">{messageResult}</Typography>
            : null}
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
    </div>
    : <Typography variant="h5">Sorry, you need to be an Administrator to access this page.</Typography>
    }
    </>
    
    )
}