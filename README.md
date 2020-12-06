# express-response 

Express middleware and fluent API to standardize REST API responses and error formatting to make your life simple again.

### Installation:
```
npm install express-stdresponse
```

### Usage:
```
const express = require('express');
const app = express();
const { response } = require('express-stdresponse');

app.get('/success',response((req,res,next)=>{
  return 'ok!';
}));

app.get('/error', response((req,res,next)=>{
  throw new Error('err!');
}))

// or add results, errors, and information to response as needed
app.get('/', response((req, res, next) => {
    var response = res.response; 
    response.error('an error');
    response.information('some info');
    response.results({a:1,b:2,c:3});
}));

const server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Example app listening at port %s', port);
});
```

For more detailed usage examples check out the unit tests in /tests