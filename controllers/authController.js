const Person = require('../models/person');
const { respondSuccess, respondError } = require('./utils/responders');


// Get current loggedin user
module.exports.getUser = async (req, res) => {
  if(req.user) respondSuccess(res, 'User found', req.user);
  else respondError(res, 'No user logged in', 404);
}

// User login
module.exports.login = async (req, res) => {
  let user = req.user;
  user.salt = undefined;
  user.hash = undefined;
  respondSuccess(res, 'User logged in successfully', user);
}

// User logout
module.exports.logout = async (req, res) => {
  req.logout((err) => {
    if(err) return next(err);
    respondSuccess(res, 'User logged out successfully');
  });
}

// User registration
module.exports.registerUser = async (req, res) => {
  try {
      const {name, email, username, password} = req.body;
      const user = new Person({
          name,
          email,
          username,
          role : 'user',
          meta : { lastLogin : { ip : req.ip }}
      });

      const registeredUser = await Person.register(user, password);

      req.login(registeredUser, (err) => {
          if(err) return next(err);
          respondSuccess(res, 'User registered successfully', registeredUser);
      });

  } catch(err) {
      respondError(res, err.message, 400);
  }
}


