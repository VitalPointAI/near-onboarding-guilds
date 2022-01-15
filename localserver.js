require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const app = express()

app.use(cors({
  origin: '*'
}))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'dist')));

app.post('/appseed', cors(), verifyToken, async (req, res) => {
    
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      const seed = (process.env.APP_SEED).slice(0, 32)
      res.json({
        seed: seed,
        authData
      });
    }
  })
  

});

app.post('/token', cors(), async (req, res) => {
  const accountId = req.body.accountId
  if(!accountId) res.sendStatus(403)
  jwt.sign({ accountId: accountId }, process.env.SECRET_KEY, (err, token) => {
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

app.listen(3000, () => {
  console.log('running')
});