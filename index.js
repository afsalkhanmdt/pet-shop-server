const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Shop = require('./Models/shop')
const cors = require('cors')
const Pet = require('./Models/pets')
const Order = require('./Models/orders')
const Otp=require('./Models/otp')
var jwt = require('jsonwebtoken')
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

app.get('/api/v1/shops/pet/:sid', async(req,res) => {
    const shopid = req.params.sid
    const shop = await Shop.findById(shopid);
    const name = shop.shopName
    const pet = await Pet.find({shopOwner: name});
    try {
       res.json(pet)  
    } catch (error) {
        res.json({message: error.message})
    }
})

app.post('/api/v1/shop/pets',authenticateToken, async(req, res) => {

let petid=short.generate()
    const pet = new Pet({
        petName: req.body.petName,
        petBreed: req.body.petBreed,
        petAge: req.body.petAge,
        
        petDescription: req.body.petDescription,
        petPrice: req.body.petPrice,
        shopOwner: req.body.shopOwner,
        shopId:req.body.shopId,
        petid:petid
    })
    
  // let petid=short.generate()
   
             
             
             pet.save()
            res.send({pet})
   
})

app.post('/api/v1/orders',authenticateToken, async(req, res) => {

    const order = new Order({
        petName: req.body.Pname,
        petBreed: req.body.Pbreed,
        userName: req.body.userName,
        phone: req.body.phone,
        petPrice: req.body.Pprice,
        shopOwner: req.body.Sname
    })

    try {
        await order.save()
        res.json({status: true, data: "Order successfull"})
    } catch (error) {
        res.json({message: error.message})
    }
})


app.get('/api/v1/myorders',authenticateToken,async(req, res) => {
    try {
        const tkid = req.user_id
        const shopDt = await Shop.findById(tkid);
        const shop = shopDt.shopName
        const orders = await Order.find({shopOwner: shop});
        res.json(orders)
    } catch (error) {
        res.json({message: error.message})
    }
})


app.get('/api/v1/profile',authenticateToken,async(req, res) => {
    try {
        const tkid = req.user_id
        const shopDt = await Shop.findById(tkid);
        res.json(shopDt)
    } catch (error) {
        res.json({message: error.message})
    }
})

app.get('/api/v1/mypets',authenticateToken,async(req, res) => {
    try {
        const tkid = req.user_id
        const shopDt = await Shop.findById(tkid);
        const shop = shopDt.shopName
        const pets = await Pet.find({shopOwner: shop});
        res.json(pets)
    } catch (error) {
        res.json({message: error.message})
    }
})

app.post('/api/v1/imageupload',async(req,res)=>{
    Object.entries(req.files).forEach(element => {
        let randomValue = crypto.randomUUID()

        req.files[element[0]].mv("./images/"+randomValue+".jpg").then((error)=>{
            if(!error)
            {
                res.send({status :true, url:randomValue+".jpg" })
                return
            }
        })
    });
})


app.post("/api/v1/forgotpassword",async(req,res)=>{
    
        const phone=req.body.phone
        const phoneData = await Shop.findOne({phone:req.body.phone});
        if(!phoneData){
          res.send({status: false, data: "NO phone number exist"});
          return;
        }
      
        const otpResponce = await sendOtp(phone);
        const otpexists = await Otp.exists({phone});
        if(!otpexists)
        {
            const otpp = await Otp.create({phone:req.body.phone,
                otp: otpResponce.otp})
        }
        else
        {
            const otpp = await Otp.findOneAndUpdate({phone:req.body.phone,
                otp: otpResponce.otp})
        }
      
      //await otp.save()
     
        if(!otpResponce){   
          res.send({status: false, data: "Failed to sent otp"});
          return;
        }
        if(otpResponce){   
            res.send({status: true, data: "successfully sent otp"});
            return;
          }
   
    });
        
      
        
app.post("/api/v1/forgotpassword/otp-verification",async(req,res)=>{
    
      
        
        const {phone,otp} = req.body;
        const otpData = await Otp.findOne({phone})
        if(!otpData){
          res.send({status: false, data: "Otp does not exists"});
          return;
        }
        
        if(otpData.otp != otp){
          res.send({status: false, data: "Wrong Otp"});
          return;
        }
        res.json({status: true,
            data: "Successfully Logedin",
            token: `Bearer ${jwt.sign({ user_id: otp._id }, process.env.JWT_SECRET)}`
           })
    });
      
      
      

app.post("/api/v1/forgotpassword/password-reset",authenticateToken,async(req,res)=>{
       
       
        const{phone,password} = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10)
      await Shop.findOneAndUpdate({phone},{password:hashedPassword});
      
        res.send({status: true, data: " Password updated successfully!"});
    
      
    });


app.post("/api/v1/placeorder",async(req,res)=>{
    
    const phone=req.body.phone
    const otpResponce = await sendOtp(phone);
    const otpexists = await Otp.exists({phone});
        if(!otpexists)
        {
            const otpp = await Otp.create({phone:req.body.phone,
                otp: otpResponce.otp})
        }
        else
        {
            const otpp = await Otp.findOneAndUpdate({phone:req.body.phone,
                otp: otpResponce.otp})
        }
     
    if(!otpResponce){   
        res.send({status: false, data: "Failed to sent otp"});
        return;
    }

    res.send({status: true, data: "successfull "})
      
   
});

app.post("/api/v1/placeorder/otp-verification",async(req,res)=>{
    
      
        
    const {phone,otp} = req.body;
    const otpData = await Otp.findOne({phone})
    if(!otpData){
      res.send({status: false, data: "Otp does not exists"});
      return;
    }
    
    if(otpData.otp != otp){
      res.send({status: false, data: "Wrong Otp"});
      return;
    }
    res.json({status: true,
        data: "Successfully Logedin",
        token: `Bearer ${jwt.sign({ user_id: otp._id }, process.env.JWT_SECRET)}`
       })
});


app.post('/api/v1/shop/update', authenticateToken, async(req, res) => {
 
    try{
        const tkid = req.user_id
        await Shop.findOneAndUpdate({_id:tkid},{shopName: req.body.shopName,
        shopLocation: req.body.shopLocation,
        pin: req.body.pin}).exec()

         
        res.json({status: true, data: "Shop upateded successfully"})
    }catch(error) {
        res.json({message: error.message})
    } });

    app.post('/api/v1/pet/update', async(req, res) => {
 
        try{
           await Pet.findOneAndUpdate({_id:req.body._id},{petName: req.body.petName,
            petBreed: req.body.petBreed,
            petAge: req.body.petAge,
            
            petDescription: req.body.petDescription,
            petPrice: req.body.petPrice,
            shopOwner: req.body.shopOwner,
            shopId:req.body.shopId
            }).exec()
    
             
            res.json({status: true, data: "Pet upateded successfully"})
        }catch(error) {
            res.json({message: error.message})
        } })
    

    app.get('/api/v1/shop/pet/:sid', async(req, res) => {
      
            const shopId = req.params.sid
            const shop = await Pet.find({shopId});
            const pets = await Pet.find({shopId});
            
            res.send({shop})
           
        
        });
        
        app.get("/api/v1/pet-delete",async(req,res) => {
    
            const petid =req.body.petid;
            const Petdata= await Pet.findOne({petid})
            console.log(Petdata)
        
            if(Petdata==null){
                res.send({status:false,data:"Invalid petid"})
                return;
            }
            await Pet.deleteOne({petid}).exec();
            {
                res.send({status: true, data: "Successfully deleted"})
            }
            
          
            
        });


       
app.listen(5000, ()=>{
    console.log('app listen in port 5000');
})