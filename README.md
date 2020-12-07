# express-response 

Express middleware and fluent API to standardize REST API responses and error formatting to make your life simple again.

### Installation:
```
npm install express-stdresponse
```

### Why express-response?
Response body normalization is important. API routes need to be able to return error codes and extended logging info in a standardized and consistent way across your API's. express-response exposes a simple response model that your routes can use that will allow you to:

1. attach error to response with your own unique error code and custom description. 

2. attach multiple errors to response (instead of a generic 400 Bad Request, you can return an error collection with descriptive validation errors for each parameter)

3. attach info objects with any response (successful or error responses).

4. automatically catch and include any unhandled errors

5. make failures transparent and responses beautiful
```
{
  "errors": [
    {
      "status": 400,
      "code": "Bad Request",
      "desc": "the request body was missing or malformed",
      "errors": [
        { "status": 400, "code": "MISSING_USERID", "desc": "missing userId" },
        { "status": 400, "code": "MISSING_PRODUCTID", "desc": "missing productId" }
      ],
      "info": [ 
        { "desc": "customer object did not include id, will assume insert" } 
      ]
    }
  ]
}
```

### Usage 
If you are using express.js there are 2 ways to use express-response.
The preferred method is the response resolver. Its a wrapper method which
handles all promise resolution, errors, and response normalization.

1. Use the response resolver for your routes eg.
```
const app = require('express').express();
const resolve = require('express-stdresponse').response;
app.get('/', resolve( request => 'ok!' ));
```

2. Use express middleware eg.
```
const app = require('express').express();
const Response = require('express-stdresponse').Response;
Response.registerExpressMiddleware(app)
app.get('/', (req,res) => 'ok!' );
```

### Example
```
const express = require('express');
const app = express();
const resolve = require('express-stdresponse').response;

app.get('/success', resolve(request => {
  return 'ok!';  // returns { "result": "ok!" }
}));

app.get('/error', resolve(request =>{
  throw new Error('err!'); // returns {"errors":[{"status":500,"desc":"err!",data:"<stacktrace>"}]}
}))

// or add results, errors, and information to response as needed
app.get('/', response((request, req, res, next) => {
    var response = res.response;
    if (req.query.throwError) response.error('an error');
    if (req.query.returnInfo) response.information('some info');    
    response.results(req.query); 

    // returns {"errors":[{"status":500,"desc":"an error"}],"info":[{"desc":"some info"}],"result":{"a":1,"b":2,"c":3}}
    return response;
}));

const server = app.listen(3000, function () {
  console.log('Example app listening at port %s', server.address().port);
});
```

For more detailed usage examples check out the unit tests in /tests