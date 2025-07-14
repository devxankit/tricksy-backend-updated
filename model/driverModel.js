import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:[true, 'Email is required!'],
        lowercase:true,
        unique:true
    },
    phone:{
        type:String,
        required:[true, 'Phone is required!'],
        unique:true,
    },
    address:{
        type:String,
        required:true
    },
    busNumber:{
        type:String,
        required:true
    },
     password:{
        type:String,
        required:[true,'Password is required!']
    },
    createdAt:{type:Date, default: new Date()},
});

const driverModel = mongoose.model('Driver', driverSchema);
export default driverModel;