const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    phone: {type: String, unique: true, required: true, length: 10},
    otp: {type:String, unique:true, require: true, length:4}

})

module.exports = mongoose.model('otp', otpSchema) 