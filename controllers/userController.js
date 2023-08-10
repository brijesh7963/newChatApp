const User=require('../models/userModel');
const Chat=require('../models/chatModel');
const bcrypt=require('bcrypt');
const registerLoad=async(req,res)=>{
    try{
        res.render('register');
    }catch(err){
        console.log(err);
    }
}

const register=async(req,res)=>{
    try{
        const passwordHash=await bcrypt.hash(req.body.password,10);
        const user=new User({
            name:req.body.name,
            email:req.body.email,
            image:'image/'+req.file.filename,
            password:passwordHash
        });

        await user.save();
        res.status(200).render('register',{message:'Your Registration has been completed'})
    }catch(err){
        console.log(err);
    }
}

const loadLogin=async(req,res)=>{
    try{
       res.render('login');
    }catch(err){
        console.log(err);
    }
}

const login=async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        const userData=await User.findOne({email:email});
        if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                req.session.user=userData;
                res.status(200).redirect('/dashboard');
            } 
            else{
                res.status(400).render('login',{message:'Email and Password is Incorrect!'});
            }
        }
        else{
            res.status(400).render('login',{message:'Email and Password is Incorrect!'});
        }

    }catch(err){
        console.log(err);
    }
}

const logout=async(req,res)=>{
    try{
         req.session.destroy();
         res.redirect('/');
    }catch(err){
        console.log(err);
    }
}

const loadDashboard=async(req,res)=>{
    try{
        var users=await User.find({_id:{$nin:[req.session.user._id]}});
        res.status(200).render('dashboard',{user: req.session.user,users:users});
    }catch(err){
        console.log(err);
    }
}

const saveChat=async(req,res)=>{
    try{
        var chat=new Chat({
            sender_id:req.body.sender_id,
            receiver_id:req.body.receiver_id,
            message:req.body.message,
        });
      var newChat=  await chat.save();
        res.status(200).send({success:true,msg:'Chat inserted!',data:newChat});
    }catch(err){
        res.status(400).send({success:false,msg:err});
    }
}
module.exports={
    registerLoad,
    register,
    loadLogin,
    login,
    logout,
    loadDashboard,
    saveChat
}