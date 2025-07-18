import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
    },
    email:{
        type:String,
        required:[true, 'Email is required!'],
        lowercase:true,
        unique: true
    },
    phone:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    createdAt:{type:Date, default: new Date()},
})

const adminModel = mongoose.model('admin', adminSchema)
export default adminModel;