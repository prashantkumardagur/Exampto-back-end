// success API responder
module.exports.respondSuccess = (res, message, data) => {
  let apiResponse = { status : 'success' , message };
  if(data) apiResponse.data = data;
  res.json(apiResponse);
}

// failure API responder 
module.exports.respondError = (res, message, code = 500) => {
  res.status(code).json({status : 'failure', message});
}