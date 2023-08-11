require('dotenv').config();
const User=require('./models/userModel');

var mongoose=require('mongoose');
mongoose.connect('mongodb+srv://viky914011:esIRNU4JwNGgEh5T@dynamic-chat-app.fa8wisw.mongodb.net/?retryWrites=true&w=majority');

const app=require('express')();
const PORT=process.env.PORT || 3000


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

    //delete old chat
    socket.on('chatDelete',function(id){
    socket.broadcast.emit('chatMessageDeleted', id);
    })

        //update old chat
    socket.on('chatUpdated',function(id){
    socket.broadcast.emit('chatMessageUpdated', id);
    })
});


http.listen(PORT,()=>{
    console.log("Server is running");
})