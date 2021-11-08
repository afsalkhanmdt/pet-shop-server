const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Shop = require('./Models/shop')
const cors = require('cors')
const Pet = require('./Models/pets')
const Otp=require('./Models/otp')
var jwt = require('jsonwebtoken')
const { findByIdAndUpdate } = require('./Models/shop')
require('dotenv').config()
const fileUpload = require('express-fileupload')
mongoose.connect('mongodb://localhost/petShop')
const db = mongoose.connection
db.once('open', ()=> {console.log('database connected');})
const short=require('short-uuid')
const crypto = require('crypto');
const {sendOtp}=require('./Models/otpmobile')
const app = express()
app.use(fileUpload())
app.use("/images", express.static("images"))
app.use(express.json())
app.use(cors())

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  
      if (err) return res.sendStatus(403)
  
      req.user_id = user.user_id
  
      next()
    })
}

app.get('/api/v1/shops', async(req, res)=>{
    try {
        const data = await Shop.find({})
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
        res.json({status: true,
             data: "Successfully Logedin",
             token: `Bearer ${jwt.sign({ user_id: shop._id }, process.env.JWT_SECRET)}`
            })
    } catch (error) {
        res.json({message: error.message})
    }
})

app.get('/api/v1/shop/:sid', async(req, res) => {
    const shopid = req.params.sid
    const shop = await Shop.findById(shopid);
    try {
        res.json(shop)
    } catch (error) {
        res.json({message: error.message})
    }
})

app.get('/api/v1/pet/:pid', async(req, res) => {
    const petid = req.params.pid
    const pet = await Pet.findById(petid);
    try {
        res.json(pet)
    } catch (error) {
        res.json({message: error.message})
    }
})


app.get('/api/v1/pets', async(req,res) => {
    const pets = await Pet.find();
    try {
       res.json(pets)     
    } catch (error) {
        res.json({message: error.message})
    }
})

app.post('/api/v1/shop/pets',authenticateToken, async(req, res) => {

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

app.get('/api/v1/profile',authenticateToken,async(req, res) => {
    try {
        const tkid = req.user_idc
        const shopDt = await Shop.findById(tkid);
        console.log(shopDt);
        res.json(shopDt)
    } catch (error) {
        res.json({message: error.message})
    }
})

app.post('/api/v1/imageupload',async(req,res)=>{
    
  
   
    Object.entries(req.files).forEach(element => {
        console.log(element)
        let randomValue = crypto.randomUUID()
        fileNames.push(randomValue +".jpg")

        req.files[element[0]].mv("./images/"+randomValue+".jpg").then((error)=>{
              console.log(error)})
    });
    
})
app.post("/api/v1/forgotpassword",async(req,res)=>{
    
       const phone=req.body.phone
        const phoneData = await Shop.findOne({phone:req.body.phone});
       console.log({phoneData})
        if(!phoneData){
          res.send({status: false, data: "NO phone number exist"});
          return;
        }
      
        const otpResponce = await sendOtp(phone);
        console.log({sendOtp})
      const otpp = await Otp.create({phone: req.body.phone,
        otp: req.body.otpResponce})
      //await otp.save()
      console.log({otpp})
        if(!otpResponce){   
          res.send({status: false, data: "Failed to sent otp"});
          return;
        }
      
   
    });
        
      
        
      app.post("/api/v1/forgotpassword/otp-verification",async(req,res)=>{
    
      
        const {phone,otp} = req.body;
        const otpData = await Otp.findOne({phone})
        
       if(!otpData.length){
          res.send({status: false, data: "Otp does not exists"});
          return;
        }
        
        if(otpData[otpData.length - 1].otp != otp){
          res.send({status: false, data: "Wrong Otp"});
          return;
        }
     
    });
      
      
      
      app.post("/api/v1/forgotpassword/password-reset",authenticateToken,async(req,res)=>{
       
        try{
        const{phone,password} = req.body;
        const hashedPassword = await generateHash(password);
      
      await Shop.findOneAndUpdate({password:hashedPassword});
      
      res.send({status: true, data: " Password updated successfully!"});
    
      }catch(error){res.json({message:error.meassage})
       }
      
    });

app.post('/api/v1/shop/update', async(req, res) => {
 
    try{
       await Shop.findOneAndUpdate({_id:req.body._id},{shopName: req.body.shopName,
        shopLocation: req.body.shopLocation,
        pin: req.body.pin}).exec()

         
        res.json({status: true, data: "Shop upateded successfully"})
    }catch(error) {
        res.json({message: error.message})
    } })


app.listen(6000, ()=>{
    console.log('app listen in port 5000');
})