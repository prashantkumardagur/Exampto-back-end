const { respondSuccess, respondError } = require('./utils/responders');

const Public = require('../models/public');


// =============================================================================================================

// Subscribing to newsletter
module.exports.subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if(!email) return respondError(res, 'No email provided', 400);

  try {
    let public = await Public.findOne({});
    if(!public) public = new Public({name: "Public", newletterEmails: [], messages: []});

    // let publicJson = public.toJSON();
    if(public.newletterEmails.includes(email)) 
    return respondSuccess(res, 'Email already subscribed', {subscribed: 3});

    public.newletterEmails.push(email);
    await public.save();
    respondSuccess(res, 'Email subscribed', {subscribed: 2});
  } catch (err) {
    respondError(res, err.message, 400);
  }
}


// Save message for admin
module.exports.sendMessage = async (req, res) => {
  const { email, message } = req.body;

  try {
    let public = await Public.findOne({});
    if(!public) public = new Public({name: "Public", newletterEmails: [], messages: []});

    public.messages.push({email, message, createdAt: Date.now()});
    await public.save();
    respondSuccess(res, 'Message sent', {sent: true});
  } catch (err) {
    respondError(res, err.message, 400);
  }
}