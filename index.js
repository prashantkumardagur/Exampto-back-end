const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');



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


// Setting up middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());


// Express middlewares
app.use(express.static(path.join( __dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// =============================================================================================================



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

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'failure',
    message: 'URL Not Found'
  });
})



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