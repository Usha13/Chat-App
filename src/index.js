const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generatemsg} = require('./utils/message')
const {
    adduser,
    removeuser,
    getusersbyroom,
    getuser
} = require('./utils/users')
    

const app = express()
const port = process.env.PORT

const server = http.createServer(app)
const io = socketio(server)


const publicdir = path.join(__dirname, '../public')
app.use(express.static(publicdir))


io.on('connection', (socket)=> {
    console.log("new server connection")
    
    
    socket.on('join', (options,callback)=>{
        
        const {user, error} = adduser({id: socket.id, ...options})
        if(error){
           return callback(error)
        }

        socket.join(user.room)       
        socket.emit('message', generatemsg("welcome"))
        socket.broadcast.to(user.room).emit('message', generatemsg(`${user.username} joined`))
        io.to(user.room).emit('roomdata', {
            room : user.room,
            users : getusersbyroom(user.room)
        })
        callback()
    })

    
    socket.on('sendmessage',(msg, callback)=>{
        const user = getuser(socket.id)
        filter = new Filter();
        if(filter.isProfane(msg)){
            return callback('profanity not allowed')
        }
        io.to(user.room).emit('message', generatemsg(msg,user.username) )
        callback('delivered')
    })

    socket.on('disconnect', ()=>{
        const user = removeuser(socket.id)
        if(user){
            io.to(user.room).emit('message', generatemsg(`${user.username} has left`))
            io.to(user.room).emit('roomdata', {
                room : user.room,
                users : getusersbyroom(user.room)
            })
        }
        
    })

    socket.on('shareloc', (loc,callback)=>{
        const user = getuser(socket.id)
        const url = "https://www.google.com/maps?q="+loc.latitude+","+ loc.longitude;
        io.to(user.room).emit('locmessage', generatemsg(url,user.username))
        callback('Location Shared')
    })
  
})

server.listen(port, ()=>{
    console.log("Server runs at port "+ port)
})