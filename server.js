import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv/config';
import connectDB from './config/mongoDB.js';

// API Config
const app = express();
const PORT = process.env.PORT || 4002;

// Middleware 
app.use(express.json());
app.use(cors());
connectDB()

// API endpoint
app.get('/',(req,res) =>{
    res.send("API Working")
})

app.listen(PORT,()=>console.log("Server is running at PORT:",PORT))


