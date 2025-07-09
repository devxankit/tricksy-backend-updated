import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    name:{
        type:true,
        required:true,
    },
    email:{
        type:String,
        required:[true, 'Email is required!'],
        lowercase:true,
    },
    phone:{
        type:Number,
        required:true,
    },
    password:{
        type:String,
        required:true
    }
})

const adminModel = mongoose.model('admin', adminSchema)