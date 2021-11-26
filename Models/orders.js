const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({

    userName: {type: String, required: true},
    phone: {type: String, required: true},
    petName: {type: String, required: true},
    petBreed: {type: String, required: true},
    petPrice: {type: String, required: true},
    shopOwner: {type: String, required: true},
    date: {type: String, required: true}
})

module.exports = mongoose.model('order', orderSchema)