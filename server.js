import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv/config';
import connectDB from './config/mongoDB.js';
import helmet from 'helmet';

// Import routes
import adminRoutes from './route/adminRoutes.js';
import userRoutes from './route/userRoutes.js';
import driverRoutes from './route/driverRoutes.js';
import accommodationRoutes from './route/accommodationRoutes.js';
import attendanceRoutes from './route/attendanceRoutes.js';
import leaveRoutes from './route/leaveRoutes.js';
import driverLocationRoutes from './route/driverLocationRoutes.js';
import driverAssignmentRoutes from './route/driverAssignmentRoutes.js';

// API Config
const app = express();
const PORT = process.env.PORT || 4002;
// const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware 
app.use(helmet());
app.use(express.json());
// app.use(cors({
//   origin: [ALLOWED_ORIGIN],
//   credentials: true
// }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
connectDB()
  .then(() => console.log('Database connection established.'))
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/accommodation', accommodationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/driver-location', driverLocationRoutes);
app.use('/api/driver-assignment', driverAssignmentRoutes);

// API endpoint
app.get('/',(req,res) =>{
    res.send("API Working")
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack || err);
  res.status(500).json({ message: 'Something went wrong!' });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
