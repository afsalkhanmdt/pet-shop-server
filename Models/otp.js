const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
   
    otp: {type: String, unique: true, required: true, length: 4},
    phone: {type: String, unique: true, required: true, length: 10},
    // password: {type: String, required: true}
})

module.exports = mongoose.model('otp', otpSchema)