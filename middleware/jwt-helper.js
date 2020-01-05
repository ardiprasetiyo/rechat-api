const jwt = require('jsonwebtoken')
const fs = require('fs')
const tokenModel = require('../models/TokenModel')

const secret = fs.readFileSync('./bin/jwt.secret.key')

const jwtVerifyMiddleware = (req, res, next) => {
    const token = req.headers.authorization
    
    if( !token ) return res.status(403).send({'statusCode' : 403, 'message' : 'Forbidden Access'}).end()

    tokenModel.getToken({'tokenID' : 'TOKEN_BLACKLIST', 'tokenCode' : token}).then(result => {

      if( result ){
        return res.status(403).send({'statusCode' : 403, 'message' : 'Invalid Token'}).end()        
      }

      try {
        let decode = jwt.verify(token, secret)
        next()
  
      } catch(err) {
          return res.status(403).send({'statusCode' : 403, 'message' : 'Token Expired'}).end()
      }

      
    }).catch(err => {
      return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
    })
    
  }

const jwtVerify = (token) => {

    if( !token ) return false

    tokenModel.getToken({'tokenID' : 'TOKEN_BLACKLIST', 'tokenCode' : token}).then(result => {
      if( result === null ){
        return false
      }

           try {
              let decode = jwt.verify(token, secret)
             return decode
  
            } catch(err) {
                return false
            }

    }).catch(err => {
      return false
    })
    
  }

const jwtGenerate = (data, expiredDate) => {
    const jwtToken = jwt.sign(data, secret, {'expiresIn' : expiredDate})
    return jwtToken
}

exports.jwtVerify = jwtVerify
exports.jwtVerifyMiddleware = jwtVerifyMiddleware
exports.jwtGenerate = jwtGenerate
