const express = require('express')
const app = express()
const path = require('path')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')
const helmet = require('helmet')

// FORCE HTTPS (HEROKU)
app.use(function(req, res, next) {
    if (process.env.NODE_ENV === 'production') {
        if (req.headers['x-forwarded-proto'] != 'https') {
            return res.redirect('https://' + req.headers.host + req.url)
        } else {
            return next()
        }
    } else {
        return next()
    }
})


app.use(bodyParser.json())
app.use(helmet())
app.use(express.static(path.join(__dirname, 'public')));


// ROUTING TABLE

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/index.html')
})

// TESTING 

app.get('/api/chat', function(req, res){
    // Dummy Data
    const dummy = [{'from' : 'usera', 'to' : 'usere' ,'message' : 'Hello World', 'datetime' : '19 April 2019 13:30'},
                   {'from' : 'userb', 'to' : 'usere' ,'message' : 'Hello World', 'datetime' : '19 April 2019 12:30'},
                   {'from' : 'userc', 'to' : 'usere' ,'message' : 'Hello World', 'datetime' : '19 April 2019 05:30'},
                   {'from' : 'userd', 'to' : 'usere' ,'message' : 'Hello World', 'datetime' : '19 April 2019 05:10'}]

    res.send({'status_code' : 200, 'results' : dummy}).statusCode(200)
})


let users = []
let emitQueue = []


io.sockets.on('connect', (socket) => {

    const socketID = socket.id
    let userJSON = {'socketID' : socketID}
    users.push(userJSON)

    socket.on('registerUser', (data) => {
    
    console.log(data.userID)
    console.log(emitQueue)

       const userID = data.userID
       const socketID = socket.id

       // Search For Socket
       let userIndex = users.findIndex((e) => {
           return e.socketID == socketID
       })

       users[userIndex].userID = userID
       
       let inQueue = emitQueue.findIndex( e => {
           return e.targetID == userID
       })
    
       if( inQueue >= 0 ){
        console.log(emitQueue[inQueue].message)
        io.sockets.to(socketID).emit('message', {'message' : emitQueue[inQueue].message, 'senderID' : emitQueue[inQueue].senderID})
        emitQueue = emitQueue.filter((e) => {
            return e.targetID != userID
        })
        console.log(emitQueue)
       }

    })

    // TESTING EMIT
    socket.on('send', (data) => {
        const message = data.message
        const userID = data.targetID
        const senderID = data.senderID

        console.log(emitQueue)
        console.log(users)

        // Finding Socket
        const targetIndex = users.findIndex( (e) => {
            return e.userID == userID
        })
       
        if( targetIndex < 0 ){
            let Queue = {'senderID' : senderID ,'targetID' : userID, 'message' : message}
            emitQueue.push(Queue) 
            io.sockets.to(socket.id).emit('message', 'Message Will Be Forwarded ')
            return 0
        }
        const socketTarget = users[targetIndex].socketID
        socket.to(socketTarget).emit('message', {'message' : message, 'senderID' : senderID})
    })

    socket.on('disconnect', () => {
        const socketID = socket.id
        users = users.filter(e => {
            return e.socketID != socketID
        })
    })

    socket.on('reconnect', () => {
        socket.id
    })
})


http.listen(process.env.PORT || 80, function(){
    console.log('Server is Listening')
})