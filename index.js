const express = require('express');
const helmet = require('helmet');
const path = require('path');



// =============================================================================================================


// Setting up mongoDB / mongoose
const mongoose = require('mongoose');
const dbURL = process.env.DB_URI || 'mongodb+srv://prashantkumar:Password024680@testcluster.8xzqf.mongodb.net/exampto?retryWrites=true&w=majority';


// Connecting to mongoDB
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));



// =============================================================================================================


// Setting up express
const app = express();


// Express middlewares
app.use(express.static(path.join( __dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Setting up helmet
// app.use(helmet());



// =============================================================================================================



let allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

app.use((req, res, next) => { 
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  next();
})

// Importing routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const coordinatorRoutes = require('./routes/coordinatorRoutes');
const examRoutes = require('./routes/examRoutes');
const editorRoutes = require('./routes/editorRoutes');


// Setting up routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/coordinator', coordinatorRoutes);
app.use('/exam', examRoutes);
app.use('/editor', editorRoutes);


// Default home route
app.get('/', (req, res) => {
  res.send({message: 'Hello World!'});
});



// =============================================================================================================


// Error handling
app.use((err, req, res, next) => {
  let { status = 500, msg = 'Something went wrong', message} = err;
  res.status(status).send({msg , message, stack: err.stack});
  next();
})



// Setting up server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('App started at port 8080');
})