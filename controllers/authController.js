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
  const { name, email, password, program } = req.body;
  console.log(program)

  const existingUser = await Person.findOne({ email });
  if(existingUser) return respondError(res, 'User already exists', 400);

  const hashedPassword = await bcrypt.hash(password, 12);


  const person = new Person({ name, email, program, password : hashedPassword, role: 'user' });
  try {
    await person.save();
    person.password = undefined;
    respondSuccess(res, 'User registered', {registered: true});
  } catch (err) {
    respondError(res, 'Failed to register', 400);
  }
}


// Change Password
module.exports.changePassword = async (req, res) => {
  const {email, currentPassword, newPassword} = req.body;

  if(req.person.email !== email) return respondError(res, 'Invalid email', 400);
  try{
    const person = await Person.findOne({email});
    if(!person) return respondError(res, 'User not found', 404);

    const passwordMatch = await bcrypt.compare(currentPassword, person.password);
    if(!passwordMatch) return respondError(res, 'Invalid password', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await Person.findByIdAndUpdate(req.person._id, {password: hashedPassword});

    respondSuccess(res, 'Password changed', true);

  } catch(err) {
    respondError(res, 'Failed to change password', 500);
  }
}

// Update profile
module.exports.updateProfile = async (req, res) => {
  const {name, phone, gender, program} = req.body;
  try{
    const person = Person.findByIdAndUpdate( 
      req.person._id, 
      {$set: {name, phone, gender, program}}, 
      function(err, result){ if(err) console.log(err); }
    );
    if(!person) return respondError(res, "Unable to update user", 400);

    respondSuccess(res, "Profile updated successfully", true);

  } catch(err) {
    respondError(res, err.message, 500);
  }
}

