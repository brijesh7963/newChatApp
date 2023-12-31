const express=require('express');
const user_route=express();
const auth=require('../middleweares/auth');
const bodyParser=require('body-parser');
const userController=require('../controllers/userController');
const path=require('path');

//session
const session=require('express-session');
const {SESSION_SECRET}=process.env;
user_route.use(session({
  secret: 'brijeshkumar',
  resave: false,
  saveUninitialized: true,
}));

//for taking form data
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

user_route.set('view engine','ejs');
user_route.set('views', path.join(__dirname, 'views'));
user_route.use(express.static('public'));


const multer=require('multer');
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
       cb(null,path.join(__dirname,'../public/image'));
    },
    filename:(req,file,cb)=>{
      const name=Date.now()+'-'+file.originalname;
      cb(null,name); 
    }
});

const upload=multer({storage:storage});
user_route.get('/register',auth.isLogout, userController.registerLoad);
user_route.post('/register',upload.single('image'),userController.register);

user_route.get('/',auth.isLogout, userController.loadLogin);
user_route.post('/',userController.login);
user_route.get('/logout',auth.isLogin,userController.logout);

user_route.get('/dashboard',auth.isLogin,userController.loadDashboard);
user_route.post('/save-chat',userController.saveChat);

user_route.post('/delete-chat',userController.deleteChat);
user_route.post('/update-chat',userController.updateChat);


user_route.get('*',(req,res)=>{
  res.redirect('/');
})
module.exports=user_route;