const Response = require('../../src/express-response');
    
// setup a simple web server with express.js and express-response
const express = require('express');
const app = express();

// must be before routes 
Response.registerExpressMiddleware(app);

// same as
// app.use(Response.requestMiddleware());
// app.use(Response.errorHandlerMiddleware());
// app.use(Response.unhandledResponseMiddleware());

app.get('/', function (req, res) {
  res.status(200).json(new Response('ok'));
});

app.post('/echo', function (req, res) {
  let response = req.expressResponse;
  response.results( req.body ); 
  response.information('just echos back the request body as the result');
  res.status(response.statusCode).json(response);
});

app.get('/unhandled-error', function (req, res) {
  throw new Error('oops, i did not handle this error');
});

app.get('/handled-error', function (req, res, next) {
  try{
    throw new Error('did handle this error');
  }
  catch (e){
    next(e);
  }
});

app.post('/mixed-error', function (req, res) {
  let response = req.expressResponse;
  response.results( req.body ); 
  response.errorBadRequest('request body missing foo');
  response.errorBadRequest('request body missing bar');

  // later when processing the request
  throw new Error('oops, i did not handle this error');
});

app.get('/unhandled-error', function (req, res) {
  throw new Error('oops, i did not handle this error');
});

app.get('/success-handled', function (req, res) {
  let response = req.expressResponse;
  response.results({ a:1, b:2, c:3});
  let a= response.information("info A");
  let b= response.information("info B");
  a.information('info A: child info 1');
  a.information('info A: child info 2');
  a.information('info A: child info 3');
  b.information('info B: child info 1');
  res.status(response.statusCode).json(response);
});

app.get('/success-unhandled', function (req, res, next) {
  let response = req.expressResponse;
  response.results({ a:1, b:2, c:3});
  let a= response.information("info A");
  let b= response.information("info B");
  a.information('info A: child info 1');
  a.information('info A: child info 2');
  a.information('info A: child info 3');
  b.information('info B: child info 1');
  // res.status(response.statusCode).json(response);
  // oops we forgot to send a response
  
  next(); // express requires you have to at least call next
          // to prevent the request from hanging
});


var server = app.listen(1337, function () {
  var port = server.address().port;
  console.log('Example app listening at port %s', port);
});

module.exports = server;