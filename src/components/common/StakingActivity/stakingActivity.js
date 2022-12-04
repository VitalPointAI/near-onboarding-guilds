import React, { useState, useEffect, useContext } from 'react'
import { appStore } from '../../../state/app'
import { queries } from '../../../utils/graphQueries'
import { 
  formatDate, 
  getPrice, 
  buildPriceTable,
  formatNearAmount, 
  } from '../../../state/near'
import { useForm } from 'react-hook-form'
import { CSVLink } from 'react-csv'
import Decimal from 'decimal.js'
import { currencies } from '../../../utils/currencies'

// Material UI components
import { makeStyles } from '@mui/styles'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
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
    const [accountValidators, setAccountValidators] = useState([])
    const [journalStartNo, setJournalStartNo] = useState(1)
    const [debitAccountName, setDebitAccountName] = useState('NEAR')
    const [creditAccountName, setCreditAccountName] = useState('Staking Income')
    const [currency, setCurrency] = useState('cad')
    const [qbExport, setQbExport] = useState([])
    const [csvSingleExport, setCsvSingleExport] = useState([])
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [priceTable, setPriceTable] = useState([])
    const [validators, setValidators] = useState(false)
    const [cardTotalReward, setCardTotalReward] = useState('0')
    const [cardTotalValue, setCardTotalValue] = useState('0')

    const [downloadReady, setDownloadReady] = useState(false)
    const [clicked, setClicked] = useState(false)

    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm()
    const { state, dispatch, update } = useContext(appStore)

    const {
      accountId,
    } = state

    useEffect(() => {
      validatorCheck().then((res) => {

      })
    },[])

    const qbHeaders = [
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

    const csvDataHeaders = [
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

    async function validatorCheck(){
      // Step 1:  Get all the activity that this account has had with validator contracts
      let allAccountValidatorActivity = []
      let startDate = new Date("10/18/2020").getTime()
      let endDate = Date.now()
      allAccountValidatorActivity = await queries.getAccountValidatorActivity(accountId, startDate.toString(), endDate.toString())

      let allAccountValidatorsActivity = []
      for (const [key, value] of Object.entries(allAccountValidatorActivity[0])){
        allAccountValidatorsActivity = allAccountValidatorsActivity.concat(value)
      }

      // Step 2: check to determine if the account has any staking data
      allAccountValidatorsActivity.length > 0 ? setValidators(true) : setValidators(false)
      
      // Step 3:  Create an array of all the unique validators this account uses
      let accountValidators = []
      for (const [key, value] of Object.entries(allAccountValidatorActivity[0])){
        for(let y = 0; y < value.length; y++){
          if(!accountValidators.includes(value[y].executorId)){
            accountValidators.push(value[y].executorId)
          }
        }
      }
      setAccountValidators(accountValidators)
      return allAccountValidatorsActivity
    }

    async function createDataExports(fromDate, toDate, accountId){
      setDownloadReady(false)
      setClicked(true)

      let finalArray = []
      let qbDownload = []
      let csvSingle = []

      let totalRewards = 0
      let totalValue = 0

      let allAccountValidatorsActivity = await validatorCheck()

      // Step 4:  Get timeframe to pass into queries
      let from = new Date(fromDate).getTime()
      let to = new Date(toDate).getTime()

      // Step 5:  For set of validators, get all ping activity between identified times
      // and sort ascending by blockTime 
      let allActivity = []
      allActivity = await queries.getValidatorPingActivity(accountValidators, from.toString(), to.toString())

      let allValidatorsActivity = []
      for (const [key, value] of Object.entries(allActivity)){
        allValidatorsActivity = allValidatorsActivity.concat(value)
      }

      // merge with all account validator activity (need all because need starting values of current shares)
      let mergedActivity = allAccountValidatorsActivity.concat(allValidatorsActivity)
      let sortedValidatorActivity = _.sortBy(mergedActivity, 'blockTime')

      // Step 6:  Determine this account's current share of the stake for each 
      // validator.  Does this by looking through each item in the array and 
      // calculating a new currentStakingShares if applicable. If not, currentStakingShares
      // remains as last one calculated (stays same until there is a change)
      
      for(let y = 0; y < accountValidators.length; y++){
          let filteredArray = sortedValidatorActivity.filter((validator) => {
            return validator.executorId == accountValidators[y]
          })

          // Determine account's current staking shares to insert into the final array
          let currentStakingShares = '0'
          for(let z = 0; z < filteredArray.length; z++){
            if(filteredArray[z].accountIdDepositing || filteredArray[z].accountIdStaking || filteredArray[z].accountId == accountId){
              if(filteredArray[z].stakingShares != null){
                currentStakingShares = filteredArray[z].stakingShares
              }
              if(filteredArray[z].totalStakingShares != null){
                currentStakingShares = filteredArray[z].totalStakingShares
              }
            }

            let contractBalance = '0'
            if(filteredArray[z].newContractStakedBalance != null){
              contractBalance = filteredArray[z].newContractStakedBalance
            }
            if(filteredArray[z].contractTotalStakedBalance){
              contractBalance = filteredArray[z].contractTotalStakedBalance
            }
            
            let contractShares = '0'
            if(filteredArray[z].contractTotalShares != null){
              contractShares = filteredArray[z].contractTotalShares
            }
            if(filteredArray[z].newContractTotalShares != null){
              contractShares = filteredArray[z].newContractTotalShares
            }

            finalArray.push({
              validator: filteredArray[z].executorId,
              epoch: filteredArray[z].epoch,
              blockTime: filteredArray[z].blockTime,
              blockHeight: filteredArray[z].blockHeight,
              contractStakedBalance: contractBalance,
              contractTotalShares: contractShares,
              currentSharePrice: parseFloat(contractBalance) / parseFloat(contractShares),
              currentStakingShares: currentStakingShares,
              currentReward: parseFloat(currentStakingShares) * (parseFloat(contractBalance) / parseFloat(contractShares))
            })
          }
        
        // now set finalArray back to from/to dates
        finalArray = finalArray.filter(function(record) {          
          return BigInt(record.blockTime) >= BigInt(from) && BigInt(record.blockTime) <= BigInt(to)
        })
   
        let journalNo = journalStartNo
        
        let tempArray = finalArray.filter(function(validator) {
          return (validator.validator == accountValidators[y] && validator.currentStakingShares != "0")
        })
        
        let sortedTempArray = _.sortBy(tempArray, 'blockTime')
      
        for(let x = 0; x < sortedTempArray.length; x++){

          let date = formatDate(sortedTempArray[x].blockTime)
          
          let priceArray = await fetchPriceTable(fromDate, toDate, accountId)
          let price = getPrice(priceArray, date, currency)
          if(!price) price = 0

          let currentReward = new Decimal(sortedTempArray[x].currentReward)
          let lastReward = x > 0 ? new Decimal(sortedTempArray[x-1].currentReward) : new Decimal(0)
          let thisReward =  x > 0 ? currentReward.minus(lastReward) : new Decimal(0)
          let fixedOne = parseFloat(thisReward).toLocaleString('fullwide', {useGrouping: false})
          
          let thisRewardFormatted
          fixedOne != "NaN" ? thisRewardFormatted = formatNearAmount(fixedOne, 5) : thisRewardFormatted = '0'
          
          totalRewards = totalRewards + parseFloat(thisRewardFormatted)
          let readyForCardReward = totalRewards.toFixed(5)
          setCardTotalReward(readyForCardReward)

          totalValue = totalValue + (parseFloat(thisRewardFormatted) * price)
          let readyForCardValue = totalValue.toFixed(2)
          setCardTotalValue(readyForCardValue)

          // ensure no zero value quantities/prices and populate various exports
          if(thisRewardFormatted != '0'){
            qbDownload.push({
              JournalNo: journalNo,
              JournalDate: date,
              Currency: currency.toUpperCase(),
              Memo: '',
              AccountName: debitAccountName,
              Debits: (parseFloat(thisRewardFormatted) * price).toFixed(2),
              Credits: '',
              Description: `Epoch: ${sortedTempArray[x].epoch}, block: ${sortedTempArray[x].blockHeight}, Quantity: ${thisReward}`,
              Name: sortedTempArray[x].validator,
              Location: '',
              Class: ''
            })

            qbDownload.push({
              JournalNo: journalNo,
              JournalDate: date,
              Currency: currency.toUpperCase(),
              Memo: '',
              AccountName: creditAccountName,
              Debits: '',
              Credits: (parseFloat(thisRewardFormatted) * price).toFixed(2),
              Description: `Epoch: ${sortedTempArray[x].epoch}, block: ${sortedTempArray[x].blockHeight}, Quantity: ${thisReward}`,
              Name: sortedTempArray[x].validator,
              Location: '',
              Class: ''
            })
          
            csvSingle.push({
              Date: date,
              Currency: currency.toUpperCase(),
              Reward: thisRewardFormatted,
              Price: price,
              Value: (parseFloat(thisRewardFormatted) * price).toFixed(2),
              Block: sortedTempArray[x].blockHeight,
              Epoch: sortedTempArray[x].epoch,
              BlockTime: `timestamp: ${sortedTempArray[x].blockTime}`,
              Validator: sortedTempArray[x].validator
            })

            journalNo ++
          }
        }
      }

      setQbExport(qbDownload)
      setCsvSingleExport(csvSingle)
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
                    onClick={(e) => createDataExports(fromDate, toDate, accountId)}
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
                      <CSVLink data={qbExport} filename={`${accountId.split('.')[0]}-staking-quickbooks.csv`} headers={qbHeaders}>
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
                      <CSVLink data={csvSingleExport} filename={`${accountId.split('.')[0]}-staking.csv`} headers={csvDataHeaders}>
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
              <Typography variant="body1">This account has no staking activity.</Typography>
            </Grid>
          </Grid>
    )
}