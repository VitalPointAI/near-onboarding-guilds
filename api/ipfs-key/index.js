const jwt = require('jsonwebtoken')

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
      return req.token
    } else {
      //Forbidden
      return false
    }
  }

module.exports = async function (context, req) {
  context.log('AppSeed testnet trigger function processed a request.');
  const token = verifyToken(req)
  if(token){
    try{
      let verified = jwt.verify(token, process.env["GUILDS_MAINNET_SECRET_KEY"])
      if(verified){
        const appSeed = process.env["GUILDS_IPFS_KEY"];
        const seed = appSeed.slice(0, 32)
        context.res.json({
          seed: seed
        });
      } else {
        context.res.sendStatus(403);
      }
    } catch (err) {
      context.log('error', err)
      context.res.sendStatus(403);
    }
  }
}