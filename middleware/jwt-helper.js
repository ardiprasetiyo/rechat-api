const jwt = require('jsonwebtoken')
const fs = require('fs')

const secret = fs.readFileSync('./bin/jwt.secret.key')

const jwtVerify = (data) => {
    const token = data
    if( !token ) return res.status(403).send({'statusCode' : 403, 'message' : 'Forbidden Access'}).end()
  
    try {
      let decode = jwt.verify(token, secret)

      // Need To Verify The Expired Time

      return decode
    } catch(err) {
      return false
    }
    
  }

const jwtGenerate = (data) => {
    return jwt.sign(data, secret)
}

exports.jwtVerify = jwtVerify
exports.jwtGenerate = jwtGenerate
