const mongoose = require('mongoose')
const uniqid = require('uniqid')

const verificationSchema = new mongoose.Schema({
    userID : {
      type: String,
      default: uniqid(),
      unique: [true, 'UserID must be unique'],
      required: [true, 'UserID is required']
    },

    verifyCode: {
      type: Number,
      required: [true, 'Verify Code is required'],
      unique: [true, 'Verify code is already exist']
    },

    expiredDate: {
      type: Number,
      required: [true, 'expiredDate is required']
    }
  })

const Verification = mongoose.model('verification', verificationSchema, 'verification')

let VerificationModel = { 
  
  'createVerification' : 
    async function createVerification(data){
      return await Verification.create({
          userID: data.userID,
          verifyCode: data.verifyCode,
          expiredDate: data.expiredDate
      })
    },

  'deleteVerification' : 
   async function deleteUser(where){
    return await Verification.deleteOne(where)
   },

  'getVerification' : 
   async function getUser(where, select=undefined){
     return await Verification.findOne(where, select)
   }
}

module.exports = VerificationModel