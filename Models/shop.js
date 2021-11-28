const mongoose = require('mongoose')

const shopSchema = new mongoose.Schema({
    shopName: {type: String, unique:true, required: true},
    shopLocation: {type: String, required: true},
    pin: {type: String, required: true, max: 6},
    email: {type: String, unique: true, required: true},
    shopImage: {type: String, required: false},
    phone: {type: String, unique: true, required: true, length: 10},
    password: {type: String, required: true},
    shopid: {type: String, required: true}
})

module.exports = mongoose.model('shop', shopSchema)