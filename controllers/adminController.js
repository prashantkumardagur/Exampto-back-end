const Person = require('../models/person');
const Exam = require('../models/exam');
const Public = require('../models/public');
const bcrypt = require('bcryptjs');

const { respondSuccess, respondError } = require('./utils/responders');

//=======================================================================================


// Gets list of all coordinators
module.exports.getCoordinators = async (req, res) => {
  try{
    let coordinators = await Person.find({role: 'coordinator'}, {name: 1, email: 1, _id: 1, meta: 1});
    respondSuccess(res, 'Coordinators fetched', coordinators);
  } catch(err) {
    respondError(res, 'Unable to fetch coordinators', 500);
  }
}


// Gets list of all users
module.exports.getUsers = async (req, res) => {
  try{
    let users = await Person.find({role: 'user'}, {name: 1, email: 1, _id: 1, meta: 1});
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




// Toggle user's ban status
module.exports.toggleBan = async (req, res) => {
  const { id } = req.body;
  if(!id) return respondError(res, 'No user id provided', 400);

  try {
    const person = await Person.findById(id);
    if(!person) return respondError(res, 'User not found', 404);

    person.meta.isBanned = !person.meta.isBanned;
    await person.save();

    let message = person.meta.isBanned ? 'User banned' : 'User unbanned';
    respondSuccess(res, message, true);
  } catch (err) {
    respondError(res, 'Failed to toggle user ban status', 400);
  }
}



// Search exams
module.exports.searchExams = async (req, res) => {
  const search = req.body.search;
  if(!search) return respondError(res, 'No search query provided', 400);
  try{
    let exams = await Exam.find(
      {$text: {$search: search}, 'meta.isPublished': true },
      {contents: 0, solutions: 0, answers: 0}
    ).limit(3);
    
    respondSuccess(res, 'Exams fetched', exams);

  } catch(err) {
    return respondError(res, 'Unable to search', 500);
  }
}


// Get messages for admin
module.exports.getMessages = async (req, res) => {
  try{
    let public = await Public.findOne({}, {messages: 1});
    if(!public) return respondError(res, 'No messages found', 404);

    respondSuccess(res, 'Messages fetched', public.messages);
  
  } catch(err) {
    return respondError(res, 'Unable to fetch messages', 500);
  }
}

// Toggle message resolve status
module.exports.toggleMessageResolve = async (req, res) => {
  const { id } = req.body;
  if(!id) return respondError(res, 'No message id provided', 400);

  try {
    const public = await Public.findOne({}, {messages: 1});
    if(!public) return respondError(res, 'No messages found', 404);

    const message = public.messages.find(message => message._id == id);
    if(!message) return respondError(res, 'Message not found', 404);

    message.isResolved = !message.isResolved;
    await public.save();

    respondSuccess(res, 'Message resolved toggled', true);
  } catch (err) {
    respondError(res, 'Failed to toggle message resolve status', 400);
  }
}

// Delete message
module.exports.deleteMessage = async (req, res) => {
  const { id } = req.body;
  if(!id) return respondError(res, 'No message id provided', 400);

  try {
    const public = await Public.findOne({}, {messages: 1});
    if(!public) return respondError(res, 'No messages found', 404);

    const message = public.messages.find(message => message._id == id);
    if(!message) return respondError(res, 'Message not found', 404);

    public.messages.pull(message);
    await public.save();

    respondSuccess(res, 'Message deleted', true);
  } catch (err) {
    respondError(res, 'Failed to delete message', 400);
  }
}