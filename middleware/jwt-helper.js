const jwt = require('jsonwebtoken')
const fs = require('fs')

// JWT Configuration
const privateKey = fs.readFileSync('./bin/rsa-private.pem', 'utf8')
const publicKey = fs.readFileSync('./bin/rsa-public.pem', 'utf8')

exports.verify = async (req, res, next) => {
    const token = req.headers.authorization

    if( !token ) return res.status(403).send({'statusCode' : 403, 'message' : 'Forbidden Access'}).end()

    try {
      let decode = await jwt.verify(token, publicKey, {algorithm : 'RS256'})
      if( decode.tokenType !== 'JWT_TOKEN' ){
        throw new Error('Forbidden Access')
      }
      req.decodedToken = decode
      next()

    } catch(err) {
        return res.status(403).send({'statusCode' : 403, 'message' : `${err.message}`}).end()
    }

    
  }


exports.verifyRefresh = async(req, res) => {
    const refreshToken = req.headers.authorization
    if( !refreshToken ){
      return res.status(403).send({'statusCode' : 403, 'message' : 'Forbidden Access'})
    }
    
    try{
      const decoded = await jwt.verify(refreshToken, publicKey, {algorithm: 'RS256'})
      if( !decoded ){
        throw new Error('FORBIDDEN_ACCESS')
      }

      if( decoded.tokenType !== 'JWT_REFRESH' ){
        throw new Error('FORBIDDEN_ACCESS')
      }

      const newToken = await this.generate({'userID' : decoded.userID}, 60 * 15)
      return res.status(200).send({'statusCode': 200, 'message': 'New token is created', 'data': [{'token': newToken.jwt, 'refreshToken': newToken.jwtRefresh}]}).end()

    }catch(error){
      console.log(error)
      if( error.message === 'FORBIDDEN_ACCESS'){
        return res.status(403).send({'statusCode' : 403, 'message' : 'Forbidden Access'}).end()
      }
      return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
    }
}

exports.generate = async (data, expiredDate) => {
    data.tokenType = 'JWT_TOKEN'
    const jwtToken = await jwt.sign(data, privateKey, {'expiresIn' : expiredDate, algorithm : 'RS256'})

    data.tokenType = 'JWT_REFRESH'
    const refreshToken = await jwt.sign(data, privateKey, {'expiresIn' : ( 60 * 60 * 24 * 2), algorithm: 'RS256'})
    
    return {'jwt' : jwtToken, 'jwtRefresh' : refreshToken}
}
