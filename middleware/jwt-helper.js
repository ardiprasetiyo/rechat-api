const jwt = require('jsonwebtoken')
const fs = require('fs')

const secret = fs.readFileSync('./bin/jwt.secret.key')

const jwtVerify = (req, res, next) => {
    if( req.path == '/' ) return next()
  
    const token = req.headers.authorization
    if( !token ) return res.status(403).send({'statusCode' : 403, 'message' : 'Forbidden Access'}).end()
  
    try {
      let decode = jwt.verify(token, secret)
      next()
    } catch(err) {
      return res.status(403).send({'statusCode' : 403, 'message' : 'Invalid Key'}).end()
    }
    
  }

const jwtGenerate = (data) => {
    return jwt.sign(data, secret)
}

exports.jwtVerify = jwtVerify
exports.jwtGenerate = jwtGenerate
