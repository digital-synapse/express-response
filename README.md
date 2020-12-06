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
const response = require('express-stdresponse');

response.registerExpressMiddleware(app);

app.get('/', function (req, res, next) {
  var response = res.response; // add results, errors, and information to this
  next();
});

const server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Example app listening at port %s', port);
});
```

For more detailed usage examples check out the unit tests in /tests