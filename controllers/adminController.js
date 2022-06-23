const Person = require('../models/person');
const bcrypt = require('bcryptjs');

const { respondSuccess, respondError } = require('./utils/responders');

//=======================================================================================


// Gets list of all coordinators
module.exports.getCoordinators = async (req, res) => {
  try{
    let coordinators = await Person.find({role: 'coordinator'}, {name: 1, email: 1, _id: 1});
    respondSuccess(res, 'Coordinators fetched', coordinators);
  } catch(err) {
    respondError(res, 'Unable to fetch coordinators', 500);
  }
}


// Gets list of all users
module.exports.getUsers = async (req, res) => {
  try{
    let users = await Person.find({role: 'user'}, {name: 1, email: 1, _id: 1});
    respondSuccess(res, 'Users fetched', users);
  } catch(err) {
    respondError(res, 'Unable to fetch users', 500);
  }
}


// Creates a new coordinator
module.exports.createNewCoordinator = async (req, res) => {
  const { name, email, password } = req.body;

  const existingCoordinator = await Person.findOne({ email });
  if(existingCoordinator) return respondError(res, 'Coordinator already exists', 400);

  const hashedPassword = await bcrypt.hash(password, 12);


  const person = new Person({ name, email, password : hashedPassword, role: 'coordinator' });
  try {
    await person.save();
    person.password = undefined;
    respondSuccess(res, 'User registered', {registered: true});
  } catch (err) {
    respondError(res, 'Failed to register', 400);
  }
}