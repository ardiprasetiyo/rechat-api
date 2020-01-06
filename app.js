const createError = require('http-errors')
const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const mongoose = require('mongoose')
const mongoDB = 'mongodb+srv://admin:p@55w0rd@rechat-1ri09.mongodb.net/rechat?retryWrites=true&w=majority'

mongoose.connect(mongoDB, { useNewUrlParser: true })
const db = mongoose.connection;

db.on('error', () =>{
  console.log('DB Disconnected')
})
db.once('open', () => {
  console.log("DB Connected")
})

// Route Instance
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/auth', authRouter)
app.use('/api/account', userRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // next(createError(404))
  res.status(404).end()
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
});

module.exports = app;
