import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from '../model/userModel.js';
import attendanceModel from '../model/attendanceModel.js';
dotenv.config();

async function markAbsentees() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const users = await userModel.find({});
  for (const user of users) {
    const attendance = await attendanceModel.findOne({
      user: user._id,
      date: { $gte: today }
    });
    if (!attendance) {
      await attendanceModel.create({
        user: user._id,
        date: today,
        status: 'absent'
      });
      console.log(`Marked absent: ${user.email}`);
    }
  }
  console.log('Absentees marked.');
  process.exit();
}

markAbsentees().catch(err => {
  console.error('Error marking absentees:', err);
  process.exit(1);
}); 