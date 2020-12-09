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
app.get('/', resolve( response => 'ok!' ));
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

app.get('/success', resolve(response => {
  return 'ok!';  // returns { "result": "ok!" }
}));

app.get('/error', resolve(response =>{
  throw new Error('err!'); // returns {"errors":[{"status":500,"desc":"err!",data:"<stacktrace>"}]}
}))

// or add results, errors, and information to response as needed
app.get('/', response((response, req, res, next) => {
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

### API Doc

#### response properties
* response.hasError - returns true if any errors have been attached to the response model
* response.statusCode - returns the highest value http status code in the response error collection or 200 if no errors have been attached to the response model
* response.hasInfo 
* response.hasResult

#### response.error()
Used to attach errors to the response body. Returns reference of inserted error model. Supports chaining.
* response.error( (string) description ) 
* response.error( (string) error_code, (string) description )
* response.error( (int) status_code, (string) error_code, (string) description )
* response.error( (int) status_code, (string) error_code, (string) description, (object) metadata )
* response.error( (string) error_code, (string) description, (object) metadata )
* response.error( (Error) error_object )
* response.error( (object) options_object )
* response.error( [ (object) options_object] )

#### response.information()
Used to attach info to the response body. Returns reference of inserted info model. Supports chaining.
* response.information( (string) description ) 
* response.information( (string) error_code, (string) description )
* response.information( (int) status_code, (string) error_code, (string) description )
* response.information( (int) status_code, (string) error_code, (string) description, (object) metadata )
* response.information( (string) error_code, (string) description, (object) metadata )
* response.information( (object) options_object )
* response.information( [ (object) options_object] )

#### response.results()
Used to attach your actual response body payload for successful requests
* response.results( (any) your_response_body_payload )
* response.setResult( (any) your_response_body_payload )

#### error helpers
Helper methods to create/attach common errors
* response.errorGatewayTimeout(description, metadata)
* response.errorInternalServerError(description, metadata)
* response.errorBadRequest(description, metadata)
* response.errorTooEarly(description, metadata)
* response.errorMethodNotAllowed(description, metadata)
* response.errorForbidden(description, metadata)

#### config object options
* config.REPORT_UNHANDLED_ERRORS: true
* config.REPORT_UNHANDLED_ERRORS_INCLUDE_STACKTRACE: true
* config.DEFAULT_ERROR_HTTP_STATUS_CODE: 500
* config.DEFAULT_SUCCESS_HTTP_STATUS_CODE: 200

