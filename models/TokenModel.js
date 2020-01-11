const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
    userID : {
      type: String,
    },

    tokenCode: {
      type: String,
      required: [true, 'Verify Code is required'],
      unique: true
    },

    expiredDate: {
      type: Number
    },

    tokenID: {
      type: String,
      required: [true, 'Token ID is required']
    }
  })

const Token = mongoose.model('verification', tokenSchema, 'token')

let TokenModel = { 
  
  'create' : 
    async function createToken(data){
      return await Token.create({
          userID: data.userID,
          tokenCode: data.tokenCode,
          expiredDate: data.expiredDate,
          tokenID: data.tokenID
      })
    },

  'delete' : 
   async function deleteToken(where){
    return await Token.deleteOne(where)
   },

  'get' : 
   async function getToken(where, select= undefined){
     return await Token.findOne(where, select)
   }
}

module.exports = TokenModel