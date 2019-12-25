const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')
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

app.get('/api/chat', function(req, res){
    // Dummy Data
    const dummy = [{'fullname' : 'Si A', 'message' : 'Hello World'},
    {'fullname' : 'Si B', 'message' : 'Hello World'},
    {'fullname' : 'Si C', 'message' : 'Hello World'},
    {'fullname' : 'Si D', 'message' : 'Hello World'}]

    res.send({'status_code' : 200, 'results' : dummy}).statusCode(200)
})




http.listen(process.env.PORT || 80, function(){
    console.log('Server is Listening')
})