const app = require('express')()
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
app.use(bodyParser.urlencoded({extended : false}))
app.use(helmet())


// ROUTING TABLE

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/test.html')
})

app.get('/api/chat', function(req, res){
    // Dummy Data
    const dummy = [{'from' : 'usera', 'to' : 'usere' ,'message' : 'Hello World', 'datetime' : '19 April 2019 13:30'},
                   {'from' : 'userb', 'to' : 'usere' ,'message' : 'Hello World', 'datetime' : '19 April 2019 12:30'},
                   {'from' : 'userc', 'to' : 'usere' ,'message' : 'Hello World', 'datetime' : '19 April 2019 05:30'},
                   {'from' : 'userd', 'to' : 'usere' ,'message' : 'Hello World', 'datetime' : '19 April 2019 05:10'}]

    res.send({'status_code' : 200, 'results' : dummy}).statusCode(200)
})


io.on('connection', function(socket){

    console.log("Client Connected")

    socket.on('chat', function(data){
        console.log(data)
        socket.emit(data.to, data.message)
    })

})




http.listen(process.env.PORT || 80, function(){
    console.log('Server is Listening')
})