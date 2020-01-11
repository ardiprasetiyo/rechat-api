const jwt = require('jsonwebtoken')
const fs = require('fs')
const TokenModel = require('../models/TokenModel')

const secret = fs.readFileSync('./bin/jwt.secret.key')

exports.verify = async (req, res, next) => {
    const token = req.headers.authorization
    if( !token ) return res.status(403).send({'statusCode' : 403, 'message' : 'Forbidden Access'}).end()

    try{
      const tokenBlacklisted = await TokenModel.get({'tokenID' : 'TOKEN_BLACKLIST', 'tokenCode' : token})
      if( tokenBlacklisted ){
        return res.status(403).send({'statusCode' : 403, 'message' : 'Invalid Token'}).end()
      }
    } catch(err){
      console.log(err.message)
      return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
    }



    try {
      let decode = await jwt.verify(token, secret)
      req.decodedToken = decode
      next()

    } catch(err) {
        return res.status(403).send({'statusCode' : 403, 'message' : `${err.message}`}).end()
    }

    
  }

exports.generate = async (data, expiredDate) => {
    const jwtToken = await jwt.sign(data, secret, {'expiresIn' : expiredDate})
    return jwtToken
}
