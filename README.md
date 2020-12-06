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

app.get('/success',response(request =>{
  return 'ok!';
}));

app.get('/error', response(request =>{
  throw new Error('err!');
}))

// or add results, errors, and information to response as needed
app.get('/', response((request, req, res, next) => {
    var response = res.response;
    if (req.query.throwError) response.error('an error');
    if (req.query.returnInfo) response.information('some info');
    response.results(req.query);
}));

const server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Example app listening at port %s', port);
});
```

For more detailed usage examples check out the unit tests in /tests