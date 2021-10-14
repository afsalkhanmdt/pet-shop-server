const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Shop = require('./Models/shop')
const shop = require('./Models/shop')
const cors = require('cors')
const Pet = require('./Models/pets')

mongoose.connect('mongodb://localhost/petShop')
const db = mongoose.connection
db.once('open', ()=> {console.log('database connected');})

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', async(req, res)=>{
    try {
        const data = await shop.find({})
        res.json(data)
    } catch (error) {
        res.json({message: error.message})
    }
})

app.post('/api/v1/signup', async(req, res) =>{
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    try{
        const shop = await Shop.create({
            shopName: req.body.shopName,
            shopLocation: req.body.shopLocation,
            pin: req.body.pin,
            email: req.body.email,
            phone: req.body.phone,
            password: hashedPassword
        })
        res.json({status: true, data: "Shop created successfully"})
    }catch(error) {
        res.json({message: error.message})
    }   
})

app.post('/api/v1/login', async(req, res) => {
    try {
        const shop = await Shop.findOne({email: req.body.email})
        if(!shop) return res.json({status: false, data: "User Not Exist"})
        if(!await bcrypt.compare(req.body.password, shop.password))
        {
            res.json({status: false, data: "Password Incorrect"})
            return
        }
        res.json({status: true, data: "Successfully Logedin"})
    } catch (error) {
        res.json({message: error.message})
    }
})

app.get('/api/v1/shop/pets', async(req,res) => {
    try {
        const pets = await Pet.find();
        res.json(pets)
    } catch (error) {
        res.json({message: error.message})
    }
})

app.post('/api/v1/shop/pets', async(req, res) => {

    const pet = new Pet({
        petName: req.body.petName,
        petBreed: req.body.petBreed,
        petAge: req.body.petAge,
        petDescription: req.body.petDescription,
        petPrice: req.body.petPrice,
        shopOwner: req.body.shopOwner
    })

    try {
        await pet.save()
        res.json({status: true, data: "Pet created successfully"})
    } catch (error) {
        res.json({message: error.message})
    }
})

app.listen(5000, ()=>{
    console.log('app listen in port 5000');
})