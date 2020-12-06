// setup a simple web server with express.js and express-response
const express = require('express');
const bodyParser = require('body-parser');
const expressResponse = require('../../src/express-response');

const app = express();
const resolve = expressResponse.response;
const Response = expressResponse.Response;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Response.registerExpressMiddleware(app);


const errorInsidePromise = async () => {
  await new Promise(resolve => setTimeout(resolve, 100)); // add a short delay to simulate DB access
  throw new Error();
}

app.get('/', resolve(() => {
  return 'ok';
}));

app.post('/echo', resolve((response, req) => {
  response.results( req.body ); 
  response.information('just echos back the request body as the result');
}));

app.get('/unhandled-error', resolve(response => {
  throw new Error('oops, i did not handle this error');
}));

app.get('/handled-error', resolve(response => {
  try{
    throw new Error('did handle this error');
  }
  catch (e){
    response.error(e);
  }
}));

app.get('/mixed-error-unhandled', resolve(response => {
  response.results( 'a result' ); 
  response.errorBadRequest('request body missing foo');
  response.errorBadRequest('request body missing bar');

  // later when processing the request
  throw new Error('oops, i did not handle this error');
}));


app.get('/mixed-error-response-unhandled', resolve(response => {
  response.results( 'a result' ); 
  response.errorBadRequest('request body missing foo');
  response.errorBadRequest('request body missing bar');
}));

app.get('/unhandled-error', resolve(() => {
  throw new Error('oops, i did not handle this error');
}));

app.get('/success-handled', resolve(response => {
  response.results({ a:1, b:2, c:3});
  let a= response.information("info A");
  let b= response.information("info B");
  a.information('info A: child info 1');
  a.information('info A: child info 2');
  a.information('info A: child info 3');
  b.information('info B: child info 1');  
  
  // although not required, its good practice to return
  // the response object from your route
  return response;
}));

app.get('/success-unhandled', resolve(response => {
  response.results({ a:1, b:2, c:3});
  let a= response.information("info A");
  let b= response.information("info B");
  a.information('info A: child info 1');
  a.information('info A: child info 2');
  a.information('info A: child info 3');
  b.information('info B: child info 1');  
}));

app.get('/success-unhandled-async', resolve(async response => {
  response.results({ a:1, b:2, c:3});
  let a= response.information("info A");
  let b= response.information("info B");
  a.information('info A: child info 1');
  a.information('info A: child info 2');
  a.information('info A: child info 3');
  b.information('info B: child info 1');
  
  await new Promise(resolve => setTimeout(resolve, 100)); // add a short delay to simulate DB access
}));

app.get('/error-unhandled-async', resolve(async response => {
  response.results({ a:1, b:2, c:3});
  let a= response.information("info A");
  let b= response.information("info B");
  a.information('info A: child info 1');
  a.information('info A: child info 2');
  a.information('info A: child info 3');
  b.information('info B: child info 1');
  
  await new Promise(resolve => setTimeout(resolve, 100)); // add a short delay to simulate DB access
  throw new Error();
}));

app.get('/error-unhandled-async2', resolve(async () => {
  await errorInsidePromise();
}));

var server = app.listen(1337, function () {
  var port = server.address().port;
  console.log('Example app listening at port %s', port);
});

module.exports = server;