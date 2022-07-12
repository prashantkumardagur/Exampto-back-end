const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Person = require('../models/person');
const { respondSuccess, respondError } = require('./utils/responders');


// ========================================================================================================

const jwtSecret = process.env.JWT_SECRET || 'server_secret';

// ========================================================================================================


// Refresh token
module.exports.refreshToken = async (req, res) => {
  const { _id, role } = req.person;
  const token = jwt.sign({ _id, role }, jwtSecret, { expiresIn: '12h' });
  respondSuccess(res, 'Token refreshed', token);
}


// User login
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  const person = await Person.findOne({ email });
  if(!person) return respondError(res, 'User not found', 404);

  if(person.meta.isBanned === true) return respondError(res, 'User is Banned', 200);
  if(person.meta.isDisabled === true) return respondError(res, 'User is disabled', 200);

  const passwordMatch = await bcrypt.compare(password, person.password);
  if(!passwordMatch) return respondError(res, 'Invalid password', 400);

  person.password = undefined;
  const token = jwt.sign({ _id: person._id, role: person.role }, jwtSecret, { expiresIn: '12h' });
  respondSuccess(res, 'User logged in', { token, person });
}


// User logout
module.exports.logout = async (req, res) => {
  respondSuccess(res, 'User logged out');
}


// User registration
module.exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await Person.findOne({ email });
  if(existingUser) return respondError(res, 'User already exists', 400);

  const hashedPassword = await bcrypt.hash(password, 12);


  const person = new Person({ name, email, password : hashedPassword, role: 'user' });
  try {
    await person.save();
    person.password = undefined;
    respondSuccess(res, 'User registered', {registered: true});
  } catch (err) {
    respondError(res, 'Failed to register', 400);
  }
}


