import React, { useState, useEffect, useContext } from 'react'
import { appStore } from '../../../state/app'
import { queries } from '../../../utils/graphQueries'
import { 
  generateId, 
  formatDate, 
  formatGeckoDate, 
  getPrice, 
  buildPriceTable,
  populateNearPriceAPI, 
  formatNearAmount, 
  updateNearPriceAPI } from '../../../state/near'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { CSVLink, CSVDownload } from 'react-csv'
import Decimal from 'decimal.js'
const axios = require('axios').default


// Material UI components
import { makeStyles } from '@mui/styles'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Input from '@mui/material/Input'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import Zoom from '@mui/material/Zoom'
import Tooltip from '@mui/material/Tooltip'
import InfoIcon from '@mui/icons-material/Info'

import qbIcon from '../../../img/qb-icon.png'
import csvIcon from '../../../img/csv-icon.png'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },    
  }));
  
export default function StakingActivity(props) {
   
    const [activity, setActivity] = useState([])
    const [validatorData, setValidatorData] = useState([])
    const [accountValidators, setAccountValidators] = useState([])
    const [journalStartNo, setJournalStartNo] = useState(1)
    const [debitAccountName, setDebitAccountName] = useState('NEAR')
    const [creditAccountName, setCreditAccountName] = useState('Staking Income')
    const [qbClass, setQbClass] = useState('')
    const [currency, setCurrency] = useState('cad')
    const [csvExport, setCsvExport] = useState([])
    const [csvSingleExport, setCsvSingleExport] = useState([])
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [priceTable, setPriceTable] = useState([])
    const [message, setMessage] = useState(<Typography variant="body1">Please add your staking validators to your profile.</Typography>)
    const [validators, setValidators] = useState(false)
    const [cardTotalReward, setCardTotalReward] = useState('0')
    const [cardTotalValue, setCardTotalValue] = useState('0')

    const [downloadReady, setDownloadReady] = useState(false)
    const [clicked, setClicked] = useState(false)

    const currencies = [
      "aed",
      "ars",
      "aud",
      "bch",
      "bdt",
      "bhd",
      "bmd",
      "bnb",
      "brl",
      "btc",
      "cad",
      "chf",
      "clp",
      "cny",
      "czk",
      "dkk",
      "dot",
      "eos",
      "eth",
      "eur",
      "gbp",
      "hkd",
      "huf",
      "idr",
      "ils",
      "inr",
      "jpy",
      "krw",
      "kwd",
      "lkr",
      "ltc",
      "mmk",
      "mxn",
      "myr",
      "ngn",
      "nok",
      "nzd",
      "php",
      "pkr",
      "pln",
      "rub",
      "sar",
      "sek",
      "sgd",
      "thb",
      "try",
      "twd",
      "uah",
      "usd",
      "vef",
      "vnd",
      "xag",
      "xau",
      "xdr",
      "xlm",
      "xrp",
      "yfi",
      "zar",
      "bits",
      "link",
      "sats",
    ]

    const classes = useStyles()
    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()
    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
      account,
      appIdx,
      did,
      didRegistryContract
    } = state

    useEffect(() => {
      async function update(){
        if(appIdx){
          // let from = new Date(2022,03,01)
          // let to = new Date(2022,03,15)
          // await populateNearPriceAPI(from, to, accountId, appIdx, didRegistryContract)
          await updateNearPriceAPI(accountId, appIdx, didRegistryContract)
        }
      }

      update()
      .then(() => {

      })
    },[appIdx])

    useEffect(() => {
      async function fetchPersona(){
        if(appIdx){
          let accountPersona = await appIdx.get('guildProfile', did)
          if(accountPersona && accountPersona.validators){
              setAccountValidators(accountPersona.validators)
              setValidators(true)
          }          
        }
      }

      fetchPersona()
      .then((res) => {

      })
    },[appIdx])

    const headers = [
      {label: "JournalNo", key: "JournalNo"},
      {label: "JournalDate", key: "JournalDate"},
      {label: "Currency", key: "Currency"},
      {label: "Memo", key: "Memo"},
      {label: "AccountName", key: "AccountName"},
      {label: "Debits", key: "Debits"},
      {label: "Credits", key: "Credits"},
      {label: "Description", key: "Description"},
      {label: "Name", key: "Name"},
      {label: "Location", key: "Location"},
      {label: "Class", key: "Class"}
    ]

    const stakingDataHeaders = [
      {label: "Date", key: "Date"},
      {label: "Currency", key: "Currency"},
      {label: "Reward", key: "Reward"},
      {label: "Price", key: "Price"},
      {label: "Value", key: "Value"},
      {label: "Block", key: "Block"},
      {label: "Epoch", key: "Epoch"},
      {label: "BlockTime", key: "BlockTime"},
      {label: "Validator", key: "Validator"}
    ]

    const handleCurrencyChange = (event) => {
      let value = event.target.value
      setCurrency(value)
    }

    const handleJournalStartNoChange = (event) => {
      let value = event.target.value
      setJournalStartNo(value)
    }

    const handleDebitAccountNameChange = (event) => {
      let value = event.target.value
      setDebitAccountName(value)
    }

    const handleFromDateChange = (event) => {
      let value = event.target.value.toString() 
      setFromDate(value)
    }

    const handleToDateChange = (event) => {
      let value = event.target.value.toString() 
      setToDate(value)
    }

    const handleCreditAccountNameChange = (event) => {
      let value = event.target.value
      setCreditAccountName(value)
    }

    const handleReset = (event) => {
      setClicked(false)
      setDownloadReady(false)
    }

    async function fetchPriceTable(fromDate, toDate, accountId){
      if(fromDate && toDate){
        let prices = await buildPriceTable(fromDate, toDate, accountId)
        setPriceTable(prices)
        return prices
      }
    }

    async function createQBExport(fromDate, toDate, accountId){
      setDownloadReady(false)

      let priceArray = await fetchPriceTable(fromDate, toDate, accountId)

      let allValidators = []
      let accountValidatorActivity = []
      let finalArray = []
      let validators = []
      let csvDownload = []
      let csvSingle = []

      let totalRewards = 0
      let totalValue = 0
         
      if(accountValidators && accountValidators.length > 0){
        setDownloadReady(false)
        setClicked(true)
        for(let y = 0; y < accountValidators.length;y++){
          
          // check whitelisted
          let whitelisted = await account.viewFunction(
            'lockup-whitelist.near', 
            'is_whitelisted', 
            {staking_pool_account_id: accountValidators[y].name}
          )
          
          let apiUrl
          if(whitelisted){
            let first = accountValidators[y].name.split('.')[0]
            let stripped = first.replace(/[^a-zA-Z]/g, '')
            apiUrl = `https://api.thegraph.com/subgraphs/name/vitalpointai/${stripped}validator`
            allValidators.push(apiUrl)
          }


          let allValidatorActivity = []
          allActivity = await queries.getValidatorActivity([apiUrl])
          
          let newActivity = allValidatorActivity.concat(
            allActivity[0][1].data.depositAndStakes, 
            allActivity[0][1].data.deposits, 
            allActivity[0][1].data.withdrawAlls,
            allActivity[0][1].data.withdraws,
            allActivity[0][1].data.unstakes,
            allActivity[0][1].data.unstakeAlls,
            allActivity[0][1].data.stakes,
            allActivity[0][1].data.stakeAlls,
            allActivity[0][1].data.pings
          )
                    
          // get this account's validator activity
          let allAccountValidatorActivity = []
          accountValidatorActivity = await queries.getAccountValidatorActivity([apiUrl], accountId)
        
          let newAccountActivity = allAccountValidatorActivity.concat(
            accountValidatorActivity[0][1].data.depositAndStakes, 
            accountValidatorActivity[0][1].data.deposits, 
            accountValidatorActivity[0][1].data.withdrawAlls,
            accountValidatorActivity[0][1].data.withdraws,
            accountValidatorActivity[0][1].data.unstakes,
            accountValidatorActivity[0][1].data.unstakeAlls,
            accountValidatorActivity[0][1].data.stakes,
            accountValidatorActivity[0][1].data.stakeAlls
          )
          
          let mergedArray = newActivity.concat(newAccountActivity)
          let sortedArray = _.sortBy(mergedArray, 'blockTime')


          
          let currentStakingShares = 0
          for(let x = 0; x < sortedArray.length; x++){
            if(sortedArray[x].accountIdDepositing || sortedArray[x].accountIdStaking || sortedArray[x].accountId){
              if(sortedArray[x].stakingShares){
                currentStakingShares = sortedArray[x].stakingShares
              }
              if(sortedArray[x].totalStakingShares){
                currentStakingShares = sortedArray[x].totalStakingShares
              }
            
            }
            finalArray.push({
              validator: accountValidators[y].name,
              epoch: sortedArray[x].epoch,
              blockTime: sortedArray[x].blockTime,
              blockHeight: sortedArray[x].blockHeight,
              contractStakedBalance: sortedArray[x].newContractStakedBalance,
              contractTotalShares: sortedArray[x].newContractTotalShares,
              currentSharePrice: parseFloat(sortedArray[x].newContractStakedBalance) / parseFloat(sortedArray[x].newContractTotalShares),
              currentStakingShares: currentStakingShares,
              currentReward: currentStakingShares * (parseFloat(sortedArray[x].newContractStakedBalance) / parseFloat(sortedArray[x].newContractTotalShares))
            })
          }
            
          setActivity(finalArray)                  
        }
        let count = 0
        let journalNo = journalStartNo
        for(let y = 0; y < accountValidators.length; y++){
          let tempArray = finalArray.filter(function(validator) {
            return (validator.validator == accountValidators[y].name && validator.currentStakingShares > 0)
          })
          console.log('temparray', tempArray)
          // restrict return to from/to dates requested
          let from = new Date(fromDate).getTime()
          // let thisFromDate = new Date(fromDate)
          // let dayBefore = (thisFromDate.getDate() - 1).getTime()
          console.log('from', from)
          let to = new Date(toDate).getTime()
          console.log('to', to)

          let datedArray = tempArray.filter(function(record) {          
            let result = BigInt(record.blockTime) > BigInt(from) && BigInt(record.blockTime) <= BigInt(to)
            if(result){
              return record
            }
          })

          console.log('datedarray', datedArray)

          let sortedTempArray = _.sortBy(datedArray, 'blockTime')
          console.log('sortedTempArray', sortedTempArray)

          let ultimateArray = []
          
          
          for(let x = 0; x < sortedTempArray.length; x++){
            ultimateArray.push({
              validator: sortedTempArray[x].validator,
              epoch: sortedTempArray[x].epoch,
              blockTime: sortedTempArray[x].blockTime,
              blockHeight: sortedTempArray[x].blockHeight,
              stakedBalance: sortedTempArray[x].currentReward,
              reward: x > 0 ? sortedTempArray[x].currentReward - sortedTempArray[x-1].currentReward : 0
            })

            let date = formatDate(sortedTempArray[x].blockTime)
            
            let price= getPrice(priceArray, date, currency)
            console.log('this price', price)
            if(!price){
              price = 0
            }

            console.log('blocktime', sortedTempArray[x].blockTime)

            
            console.log('currentreward', parseFloat(sortedTempArray[x].currentReward).toLocaleString('fullwide', {useGrouping: false}))

            let currentReward = new Decimal(sortedTempArray[x].currentReward)
            let lastReward = x > 0 ? new Decimal(sortedTempArray[x-1].currentReward) : new Decimal(0)
            let thisReward =  x > 0 ? currentReward.minus(lastReward) : new Decimal(0)
            let fixedOne = parseFloat(thisReward).toLocaleString('fullwide', {useGrouping: false})
            console.log('this reward 0', fixedOne)
            let thisRewardFormatted
            fixedOne != "NaN" ? thisRewardFormatted = formatNearAmount(fixedOne, 5) : thisRewardFormatted = '0'
            console.log('this reward formatted 1', thisRewardFormatted)
            console.log('this reward formatted', parseFloat(thisRewardFormatted))
            totalRewards = totalRewards + parseFloat(thisRewardFormatted)
            console.log('total rewards', totalRewards)
            let readyForCardReward = totalRewards.toFixed(5)
            setCardTotalReward(readyForCardReward)

            totalValue = totalValue + (parseFloat(thisRewardFormatted) * price)
           
            let readyForCardValue = totalValue.toFixed(2)
            setCardTotalValue(readyForCardValue)

            // ensure no zero value quantities/prices
            if(thisRewardFormatted != '0'){
              csvDownload.push({
                JournalNo: journalNo,
                JournalDate: date,
                Currency: currency,
                Memo: '',
                AccountName: debitAccountName,
                Debits: (parseFloat(thisRewardFormatted) * price).toFixed(2),
                Credits: '',
                Description: `Epoch: ${sortedTempArray[x].epoch}, block: ${sortedTempArray[x].blockHeight}, Quantity: ${thisReward}`,
                Name: sortedTempArray[x].validator,
                Location: '',
                Class: ''
              })

              csvDownload.push({
                JournalNo: journalNo,
                JournalDate: date,
                Currency: currency,
                Memo: '',
                AccountName: creditAccountName,
                Debits: '',
                Credits: (parseFloat(thisRewardFormatted) * price).toFixed(2),
                Description: `Epoch: ${sortedTempArray[x].epoch}, block: ${sortedTempArray[x].blockHeight}, Quantity: ${thisReward}`,
                Name: sortedTempArray[x].validator,
                Location: '',
                Class: ''
              })
              console.log('blocktime here', sortedTempArray[x].blockTime)
              csvSingle.push({
                Date: date,
                Currency: currency,
                Reward: thisRewardFormatted,
                Price: price,
                Value: (parseFloat(thisRewardFormatted) * price).toFixed(2),
                Block: sortedTempArray[x].blockHeight,
                Epoch: sortedTempArray[x].epoch,
                BlockTime: sortedTempArray[x].blockTime,
                Validator: sortedTempArray[x].validator
              })

              journalNo ++
            }
          }
          validators.push(ultimateArray)
          setValidatorData(validators)
          setCsvExport(csvDownload)
          setCsvSingleExport(csvSingle)
          count++
        }
      }

      setDownloadReady(true)
      return true
    }

  return (
    validators ? 
            <Grid container alignItems="center" justifyContent="center" spacing={0} >
              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center" style={{marginBottom: '20px'}}>
                <Card>
                  <Typography variant="h6" align="center">Staking Rewards</Typography>
                  <Typography variant="caption" align="center"></Typography>
                  <Typography variant="body1" align="center">{cardTotalReward}</Typography>
                </Card>
              </Grid>
            
              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} align="center" style={{marginBottom: '20px'}}>
                <Card>
                  <Typography variant="h6" align="center">Value
                    <Tooltip TransitionComponent={Zoom} title="The accumulated acquisition cost (adjusted cost basis) of the rewards.  This is the accumulated value of the rewards on the day they are received.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                    </Tooltip>
                  </Typography>
                  <Typography variant="body1" align="center">{cardTotalValue}</Typography>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="fromDate"
                  type = "date"
                  name="fromdate"
                  label="From"
                  value={fromDate}
                  onChange={handleFromDateChange}
                  InputLabelProps={{shrink: true,}}
                  inputRef={register({
                      required: false                              
                  })}
                />
              </Grid> 
              <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="toDate"
                  type = "date"
                  name="todate"
                  label="To"
                  value={toDate}
                  onChange={handleToDateChange}
                  InputLabelProps={{shrink: true,}}
                  inputRef={register({
                      required: false                              
                  })}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <TextField
                    id="journalStart"
                    label="Journal Start #"
                    type = "number"
                    name="journalStart"
                    value={journalStartNo}
                    onChange={handleJournalStartNoChange}
                    inputRef={register({
                        required: false                              
                    })}
                  />
                </FormControl>
              </Grid> 
              <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="currency">Currency</InputLabel>
                  <Select
                    labelId="currency"
                    label="Currency"
                    id = "currency"
                    variant="contained"
                    value = {currency}
                    onChange = {handleCurrencyChange}
                    input={<Input />}
                    >
                    {currencies.map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <TextField
                margin="dense"
                id="debitAccountName"
                variant="outlined"
                name="debitAccountName"
                label="Debit Account Name"
                placeholder="NEAR"
                value={debitAccountName}
                onChange={handleDebitAccountNameChange}
                inputRef={register({
                    required: false                              
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <TextField
                margin="dense"
                id="creditAccountName"
                variant="outlined"
                name="creditAccountName"
                label="Credit Account Name"
                placeholder="Staking Income"
                value={creditAccountName}
                onChange={handleCreditAccountNameChange}
                inputRef={register({
                    required: false                              
                })}
              />
            </Grid>
           
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop: '20px'}}>
              
              {!downloadReady ?
                !clicked ?
                  <Button 
                    variant="outlined"
                    onClick={(e) => createQBExport(fromDate, toDate, accountId)}
                  >
                  Create Data Exports
                </Button>
                : <>
                  <Typography variant="body1">Preparing Data</Typography>
                  <LinearProgress />
                  </>
                  : <Grid container spacing={0} justifyContent="space-between" alignItems="center">
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{marginTop:'20px'}} align="center">
                    <Typography variant="h6">
                      Downloads
                    </Typography>
                  </Grid>
                    <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center">
                      <CSVLink data={csvExport} filename={`${accountId.split('.')[0]}-staking-quickbooks.csv`} headers={headers}>
                        <img src={qbIcon} style={{width:'30px', height:'auto'}}/>
                        <Typography variant="body1" style={{marginTop: '-5px'}}>
                          Quickbooks
                        </Typography>
                      </CSVLink>
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center">
                      <Button 
                        variant="outlined"
                        onClick={handleReset}
                      >
                      Reset
                      </Button>
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} lg={4} xl={4} align="center">
                      <CSVLink data={csvSingleExport} filename={`${accountId.split('.')[0]}-staking.csv`} headers={stakingDataHeaders}>
                        <img src={csvIcon} style={{width:'30px', height:'auto'}}/>
                        <Typography variant="body1" style={{marginTop: '-5px'}}>
                          CSV
                        </Typography>
                      </CSVLink>
                    </Grid>
                  </Grid>
                }
              </Grid>
            </Grid>
        : <Grid container alignItems="center" justifyContent="center" spacing={0} >
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            {message}
            </Grid>
          </Grid>
    )
}