import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    phone:{
        type:Number,
        required:[true, 'Phone number required!'],
        unique:true,
    },
    email:{
        type:String,
        required:[true,'Email is required!'],
        unique:true,
        lowercase:true,
    },
    address:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:[true,'Password is required!']
    },
    createdAt:{type:Date, default: new Date()},
})

const userModel= mongoose.model('User', userSchema);
export default userModel;