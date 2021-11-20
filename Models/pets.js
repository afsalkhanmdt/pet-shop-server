const mongoose = require('mongoose')

const petSchema = new mongoose.Schema({
    petName: {type: String, required: true},
    petBreed: {type: String, required: true},
    petAge: {type: String, required: true},
    petDescription: {type: String, required: true},
    petPrice: {type: String, required: true},
    petImage: {type: String, required: false},
    shopOwner: {type: String, required: true},
    // shopId: {type: String, required: true},
    petid:{type:String, unique:true,requried:true,length:5}
})

module.exports = mongoose.model('pet', petSchema)