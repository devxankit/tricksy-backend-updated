import adminModel from '../model/adminModel.js';

const createToken =(id) =>{
    return jwt.sign({id},process.env.Jwt_Secret)
}
const registerAdmin = async (req, res) =>{
   const role = 'ADMIN'
   try {
    const { phone, password } = req.body;
    if(!phone || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" })
    }
    const exist = await adminModel.findeOne({phone});
    if(exist){
        return res.json({success:false, message:"User Already Exists"})
    }
    if(!validator.isMobilePhone(phone)){
        return res.json({success:false, message:"Please Enter Valid phone"});
    }
    if(password.length < 8){
        return res.json({success:false, message:"Please Enter Strong Password"});
    } 
    // Saving user
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password,salt);
    const newUser = new UserModel({
        phone,
        password:hashpassword,
    })
    const user = await newUser.save()
    const token = createToken(user._id)
    res.json({success:true,token})

   } catch (error) {
    
   }
    
}