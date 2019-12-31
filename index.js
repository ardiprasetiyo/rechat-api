const express = require('express')
const app = express()
const path = require('path')
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    pingInterval: 500,
    pingTimeout: 1000
})
const bodyParser = require('body-parser')
const helmet = require('helmet')
const queueHelper = require('./helper_modules/queueHelper.js')

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
let messageQueue = []

const UserJSON = (socketID) => {
    let User = {}
    User.socketID = socketID
    return User
}

const MessageJSON = (senderID, receiverID, messageID, message) => {
    let Message = {}
    Message.senderID = senderID
    Message.receiverID = receiverID
    Message.messageID = messageID
    Message.message = message
    Message.isRead = 0 
    return Message
}

io.on('connection', (socket) => {

    const socketID = socket.id
    const userJSON = new Object(UserJSON(socketID))
    users.push(userJSON)
    
    socket.on('userConnect', (data) => {
        const userID = data.userID
        const socketID = socket.id
        users.forEach((e) => {
            if( e.socketID == socketID ){
                e.userID = userID
                return true
            }
        })

    })

    socket.on('send', (data) => {
        const senderID = data.senderID
        const receiverID = data.receiverID
        const messageID = Math.random().toString().split('.')[1]
        const message = data.message
        // Need Validation Here

        const messageJSON = new Object(MessageJSON(senderID, receiverID, messageID, message))
        messageQueue.push(messageJSON)

        // Emit To Receiver
        const receiverSocket = queueHelper.findSocket(receiverID, users)
        if( receiverSocket ){
            socket.to(`${receiverSocket.socketID}`).emit('incomingMessage', {'messageID' : messageID})
        }

        // Emit To Self
        io.sockets.to(`${socket.id}`).emit('sendCallback', messageJSON)
    })
    
    socket.on('getMessage', (data) => {
        const messageID = data.messageID
        const message = queueHelper.findMessage(messageID, messageQueue)
        if( message ){
            io.sockets.to(`${socket.id}`).emit('message', message)
            
            // Update Status Message To Sender
            const senderSocket = queueHelper.findSocket(message.senderID, users)
            if( senderSocket ){
                socket.to(`${senderSocket.socketID}`).emit('sendUpdate', {'messageID' : messageID})
            }

            messageQueue.forEach((e) => {
                if( e.messageID == messageID ){
                    e.isRead = 1
                }
            })
        }

    })

    socket.on('checkingMessage', (data) => {
        const userID = data.userID
        messageQueue.forEach((e) => {
            if( e.receiverID == userID && e.isRead == 0 ){
                io.sockets.to(`${socket.id}`).emit('message', e)
            }
        })
    })

    socket.on('disconnect', () => {
        const socketID = socket.id
        users = users.filter((e) => {
            return e.socketID != socketID
        })
    })

})

http.listen(process.env.PORT || 80, function(){
    console.log('Server is Listening')
})