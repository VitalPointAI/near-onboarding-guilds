const jwt = require('jsonwebtoken')

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const accountId = req.body.accountId
    if(!accountId) context.res.sendStatus(403)
    let token = jwt.sign({accountId: accountId }, process.env["GUILDS_MAINNET_SECRET_KEY"])
    if(token){
      context.res.json({
        token
      })
    } else {
      context.res.sendStatus(404)
    }
}