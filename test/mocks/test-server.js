const { response } = require('../../src/express-response');
    
// setup a simple web server with express.js and express-response
const express = require('express');
const app = express();

// must be before routes 
//Response.registerExpressMiddleware(app);

// same as
// app.use(Response.requestMiddleware());
// app.use(Response.errorHandlerMiddleware());
// app.use(Response.unhandledResponseMiddleware());

app.get('/', response((req, res)=> {
  return 'ok';
}));

app.post('/echo', response((req, res) => {
  let response = res.response;
  response.results( req.body ); 
  response.information('just echos back the request body as the result');
}));

app.get('/unhandled-error', response((req, res) => {
  throw new Error('oops, i did not handle this error');
}));

app.get('/handled-error', response((req, res, next) => {
  try{
    throw new Error('did handle this error');
  }
  catch (e){
    next(e);
  }
}));

app.post('/mixed-error-unhandled', response((req, res) => {
  let response = res.response;
  response.results( req.body ); 
  response.errorBadRequest('request body missing foo');
  response.errorBadRequest('request body missing bar');

  // later when processing the request
  throw new Error('oops, i did not handle this error');
}));


app.post('/mixed-error-response-unhandled', response((req, res) => {
  let response = res.response;
  response.results( req.body ); 
  response.errorBadRequest('request body missing foo');
  response.errorBadRequest('request body missing bar');
}));

app.get('/unhandled-error', response((req, res) => {
  throw new Error('oops, i did not handle this error');
}));

app.get('/success-handled', response((req, res) => {
  let response = res.response;
  response.results({ a:1, b:2, c:3});
  let a= response.information("info A");
  let b= response.information("info B");
  a.information('info A: child info 1');
  a.information('info A: child info 2');
  a.information('info A: child info 3');
  b.information('info B: child info 1');  
  return response;
}));

app.get('/success-unhandled', response((req, res, next) => {
  let response = res.response;
  response.results({ a:1, b:2, c:3});
  let a= response.information("info A");
  let b= response.information("info B");
  a.information('info A: child info 1');
  a.information('info A: child info 2');
  a.information('info A: child info 3');
  b.information('info B: child info 1');
}));

app.get('/success-unhandled-async', response(async (req, res, next)=> {
  let response = res.response;
  response.results({ a:1, b:2, c:3});
  let a= response.information("info A");
  let b= response.information("info B");
  a.information('info A: child info 1');
  a.information('info A: child info 2');
  a.information('info A: child info 3');
  b.information('info B: child info 1');
  
  await new Promise(resolve => setTimeout(resolve, 100)); // add a short delay to simulate DB access
}));

var server = app.listen(1337, function () {
  var port = server.address().port;
  console.log('Example app listening at port %s', port);
});

module.exports = server;