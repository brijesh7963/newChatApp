require('dotenv').config();
const User=require('./models/userModel');

var mongoose=require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/dynamic-chat-app');

const app=require('express')();



//user route
const Chat=require('./models/chatModel')
const userRoute=require('./routes/userRoutes');
app.use('/',userRoute);

const http=require('http').Server(app);
const io=require('socket.io')(http);
var usp=io.of('/user-namespace');
usp.on('connection',async(socket)=>{
    console.log('User Connected');
    
    var userId=socket.handshake.auth.token;

    await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'1'}});
    
    //user broadcast online status
    socket.broadcast.emit('getOnlineUser',{user_id:userId});
    
    socket.on('disconnect',async()=>{
        console.log('user Disconnected');
        var userId=socket.handshake.auth.token;
        await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'0'}});

        //user broadcast ofline status
        socket.broadcast.emit('getOfflineUser',{user_id:userId});
        
    });
    
    //chatting implementation
    socket.on('newChat',(data)=>{
        socket.broadcast.emit('loadNewChat',data);
    });
    //load old chat
    socket.on('existsChat',async function(data){
        var chats=await Chat.find({$or:[
            {sender_id:data.sender_id,receiver_id:data.receiver_id},
            {sender_id:data.receiver_id,receiver_id:data.sender_id},
        ]});
        socket.emit('loadChats',{chats:chats});
    });
});



http.listen(3000,()=>{
    console.log("Server is running");
})