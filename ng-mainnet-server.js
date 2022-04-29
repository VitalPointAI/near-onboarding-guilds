require('dotenv').config({ path: './.env.main' })
const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const app = express()
const { DefaultAzureCredential } = require("@azure/identity")
const { SecretClient } = require("@azure/keyvault-secrets")

const credential = new DefaultAzureCredential()

const vaultName = process.env.VAULT_NAME

const url = `https://${vaultName}.vault.azure.net`

const client = new SecretClient(url, credential)

const secretKey = process.env.SECRET_KEY
const secretSeed = process.env.SEED
const fundingSeed = process.env.NG_FUNDING_SEED
const sendyAPI = process.env.SENDY_API

const allowList = ['https://mynear.xyz, https://ceramic-node.vitalpointai.com']

app.use(cors({
  origin: '*'
}));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'dist')));

app.post('/appseed', cors(), verifyToken, async (req, res) => {
  let latestTokenResponse = await client.getSecret(secretKey)
  jwt.verify(req.token, latestTokenResponse.value, async (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      const latestSecret = await client.getSecret(secretSeed)
      const seed = (latestSecret.value).slice(0, 32)
      res.json({
        seed: seed,
        authData
      });
    }
  })
});

app.post('/funding-seed', cors(), verifyToken, async (req, res) => {
  let latestTokenResponse = await client.getSecret(secretKey)
  jwt.verify(req.token, latestTokenResponse.value, async (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      const latestSecret = await client.getSecret(fundingSeed)
      const seed = (latestSecret.value)
      
      res.json({
        seed: seed,
        authData
      });
    }
  })
});

app.post('/sendy', cors(), verifyToken, async (req, res) => {
  let latestTokenResponse = await client.getSecret(secretKey)
  jwt.verify(req.token, latestTokenResponse.value, async (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      const latestSecret = await client.getSecret(sendyAPI)
      const seed = (latestSecret.value)
      res.json({
        seed: seed,
        authData
      });
    }
  })
});

app.post('/token', cors(), async (req, res) => {
  const accountId = req.body.accountId
  console.log('account', accountId)
  if(!accountId) res.sendStatus(403)
  const latestTokenSecret = await client.getSecret(secretKey)
  jwt.sign({ accountId: accountId }, latestTokenSecret.value, (err, token) => {
    res.json({
      token
    })
  });
});

app.get('/*', cors(), function (req, res) {
  // res.setHeader(
  //   'Content-Security-Policy-Report-Only',
  //   "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
  // );
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next){
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined'){
    // Split at the space
    const bearerToken = bearerHeader.split(' ')[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    //Forbidden
    res.sendStatus(403);
  }
}

app.listen(3004, () => {
  console.log('running')
  console.log('and listening')
});