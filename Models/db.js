const mongoose=require('mongoose')

module.exports =async function connection(){
    try {
        const connectionParams ={
            useNewUrlParser:true,
            useCreateIndex:true,
            useUnifiedTopology:true
        }
        await mongoose.connect
    } catch (error) {
        
    }
}