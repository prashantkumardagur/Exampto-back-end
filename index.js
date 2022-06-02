const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');

const passport = require('passport');
const LocalStrategy = require('passport-local');



// =============================================================================================================


// Setting up mongoDB / mongoose
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
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


// Setting up session
const secret = process.env.SECRET || 'g6Hf7JS83fGK89jS';
const sessionConfig = {
    name: 'app',
    secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        // secure : true, // For production phase, turn off in developing phase.
        maxAge : 86400000 // One day in milliseconds
    },
    store : MongoStore.create({
        mongoUrl : dbURL,
        secret,
        touchAfter : 86400 // One day in seconds
    })
}

app.use(cookieParser());
app.use(session(sessionConfig));


// Setting up helmet
// app.use(helmet());



// =============================================================================================================


// Importing User model
const Person = require('./models/person');


// Setting up passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Person.authenticate()));
passport.serializeUser(Person.serializeUser());
passport.deserializeUser(Person.deserializeUser());



// =============================================================================================================

app.use('*', (req, res, next) => { 
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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