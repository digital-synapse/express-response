const DEFAULT_ERROR_HTTP_STATUS_CODE = 500;
const DEFAULT_SUCCESS_HTTP_STATUS_CODE = 200;

class Response {

    // create a standard express response object and attaches it to the request
    // so that it is available later to be modified
    // define this first in your express middleware
    // app.use(Response.requestMiddleware);
    static requestMiddleware() {
        return (req, res, next) =>{
            res.response = new Response();
            next();
        };
    }

    // ensure that the response object is always send even if the route
    // does not explicitly do so
    static unhandledResponseMiddleware(){
        return (req, res, next) =>{            
            const response = res.response
            res.on('finish', ()=>{
                if (!response.hasError && (response.hasInfo || response.hasResult)){
                    if (!res.headersSent){
                        res.status(res.statusCode).json(response);      
                    }
                }
                else if (!res.headersSent){
                    response.error(404, 'Not Found', `The requested route '${req.originalUrl}' could not be found`);
                }
            });
            next();
        };
    }

    // if an error was unhandled, format the response here to ensure all responses are standardized
    // define this last in your express middleware
    // app.use(Response.errorHandlerMiddleware)
    static errorHandlerMiddleware () { 
        return (err, req, res, next) => {
            let response = res.response || new Response();
            response.addError(err.statusCode, err.statusMessage, err.message, err.stack);        
            res.status(response.statusCode).json(response);
        }
    }

    // shortcut method to register all express-response middleware in the correct order
    static registerExpressMiddleware (app){
        app.use(Response.requestMiddleware());
        app.use(Response.errorHandlerMiddleware());
        app.use(Response.unhandledResponseMiddleware());
        return app;
    }
    
    constructor( optionalResult ){
        if (optionalResult != undefined){
            this.results(optionalResult);
        }
    }
    
    error( err ){
        
        if (arguments.length == 1){
            // 1 string argument - treat as error description
            if (typeof err === 'string' || err instanceof String){
                return this.addError(undefined,undefined,err,undefined);
            }
            // 1 object argument - treat as 'options' object
            else if (typeof err === 'object' && err instanceof Object){
                return this.addError(err.status, err,code, err.description, err.metadata);
            }
            // 1 array argument - treat as multiple errors
            else if (typeof err === 'array' && err instanceof Array){
                return err.forEach(x=> this.error(err));
            }
        }
        else {
            let status;
            let code;
            let description;
            let metadata;
            [...arguments].forEach(arg => {
                if (Number.isInteger(arg)) status = arg;
                else if (typeof(arg) === 'string' || arg instanceof String)
                {    
                    // are there exactly 2 string arguments - assume first is code and second is description
                    if ([...arguments].map(a => (typeof(a) === 'string' || a instanceof String) ? 1 : 0)
                        .reduce((x,y)=>x+y,0) == 2)
                    {
                        if (!code)
                            code = arg;                        
                        else if (!description)
                            description = arg; 
                    }
                    else
                    {
                        if (!description)
                            description = arg;
                        else if (!code)
                            code = arg;
                        else
                            throw new Error('unknown string argument passed to express-response error function.');
                    }
                }
                else if (typeof(arg) === 'object' || arg instanceof Object){
                    if (!metadata)
                        metadata = arg;

                    // if all the arguments are objects, treat as seperate options objects
                    else if ([...arguments]
                        .map(a => (typeof(a) === 'object' || a instanceof Object) ? 1 : 0)
                        .reduce((x,y)=>x+y,0)
                        == arguments.length)
                    {
                        [...arguments].forEach(options => {
                            this.error(options);
                        })
                        return;
                    }
                    else 
                        throw new Error('unknown object argument passed to express-response error function')
                }
            });
            return this.addError(status,code,description,metadata);
        }
        return undefined;
    }

    information( info ){
        
        if (arguments.length == 1){
            // 1 string argument - treat as info description
            if (typeof info === 'string' || info instanceof String){
                return this.addInfo(undefined,undefined,info,undefined);
            }
            // 1 object argument - treat as 'options' object
            else if (typeof info === 'object' && info instanceof Object){
                return this.addInfo(info.status , info.code, info.description, info.metadata);
            }
            // 1 array argument - treat as multiple infos
            else if (typeof info === 'array' && info instanceof Array){
                return info.forEach(x=> this.information(info));
            }
        }
        else {
            let status;
            let code;
            let description;
            let metadata;
            [...arguments].forEach(arg => {
                if (typeof(arg) === 'string' || arg instanceof String)
                {    
                    if (Number.isInteger(arg)) status = arg;
                    // are there exactly 2 string arguments - assume first is code and second is description
                    else if ([...arguments].map(a => (typeof(a) === 'string' || a instanceof String) ? 1 : 0)
                        .reduce((x,y)=>x+y,0) == 2)
                    {
                        if (!code)
                            code = arg;                        
                        else if (!description)
                            description = arg; 
                    }
                    else
                    {
                        if (!description)
                            description = arg;
                        else if (!code)
                            code = arg;
                        else
                            throw new Error('unknown string argument passed to express-response info function.');
                    }
                }
                else if (typeof(arg) === 'object' || arg instanceof Object){
                    if (!metadata)
                        metadata = arg;

                    // if all the arguments are objects, treat as seperate options objects
                    else if ([...arguments]
                        .map(a => (typeof(a) === 'object' || a instanceof Object) ? 1 : 0)
                        .reduce((x,y)=>x+y,0)
                        == arguments.length)
                    {
                        [...arguments].forEach(options => {
                            this.information(options);
                        })
                        return;
                    }
                    else 
                        throw new Error('unknown object argument passed to express-response info function')
                }
            });
            return this.addInfo(status, code,description,metadata);
        }

        return undefined;
    }


    setResult( result ){
        this.result = result;
        return this;
    }

    results( result ){
        this.setResult(result);
        return this;
    }
    addError( status, code, description, metadata, checkDuplicateCode=true ){
        if (!this.errors){ 
            this.errors = [];
        }
        if (!status){
            status = DEFAULT_ERROR_HTTP_STATUS_CODE;
        }
        // do not permit duplicate error in response
        let duplicate = undefined;
        if (checkDuplicateCode && code) duplicate = this.errors.find(x=> x.code == code);        
        if (description && !duplicate) duplicate = this.errors.find(x=> x.desc == description);
        
        if (!duplicate){
            let errorObject = new ResponseError(status, code, description, metadata);
            this.errors.push(errorObject);
            return errorObject;
        }

        // if this was a dupe just return the original error
        return duplicate;
    }

    addInfo( status, code, description, metadata){
        if (!this.info){
            this.info=[];
        }

        // do not permit duplicate info in response
        let duplicate = undefined;
        if (code) duplicate = this.info.find(x=> x.code == code);        
        if (description && !duplicate) duplicate = this.info.find(x=> x.desc == description);
        if (!duplicate){
            let infoObject = new ResponseInfo(status, code, description, metadata);
            this.info.push(infoObject);
            return infoObject;
        }

        // if this was a dupe just return the original info object
        return duplicate;
    }

    getHasError(){
        return this.errors != undefined && this.errors.length > 0;
    }

    get hasError() {
        return this.getHasError();
    }

    getHasInfo(){
        return this.info != undefined && this.info.length > 0;
    }

    get hasInfo() {
        return this.getHasInfo();
    }

    getHasResult(){
        return this.result != undefined;
    }

    get hasResult() {
        return this.getHasResult();
    }

    getJson(){
        return JSON.stringify(this);
    }
    
    get json(){
        return this.getJson();
    }

    // return the highest value error (http status code)
    getStatus(){
        if (this.errors){
            return Math.max.apply(null,this.errors.map(x => x.status));
        }
        return DEFAULT_SUCCESS_HTTP_STATUS_CODE;
    }

    getStatusCode(){
        return this.getStatus();
    }

    get statusCode(){
        return this.getStatus();
    }

    errorGatewayTimeout(description, metadata){
        return this.addError(504, 'Gateway Timeout', description || 'an internal service took too long to respond', metadata,false);
    }

    errorInternalServerError(description, metadata){
        return this.addError(500, 'Internal Server Error', description || 'an internal API state was unexpected', metadata, false)
    }

    errorBadRequest(description, metadata){
        return this.addError(400, 'Bad Request', description || 'the request body was missing or malformed', metadata, false);
    }

    errorTooEarly(description, metadata){
        return this.addError(425, 'Too Early', description || 'api or internal dependency is still initializing', metadata, false);
    }

    errorMethodNotAllowed(description, metadata){
        return this.addError(405, 'Method Not Allowed', description || 'the request method is known to the server but has been disabled and cannot be used', metadata, false);
    }

    errorForbidden(description, metadata){
        return this.addError(403, 'Forbidden', description || 'the requested data is access-protected and that the request cannot be performed due to the client not having authority.', metadata, false);
    }
}

class ResponseError extends Response {
    constructor(status, code, description, metadata){
        super();
        this.status = status;
        this.code = code;
        this.desc = description;
        this.data = metadata;
    }
}

class ResponseInfo extends Response {
    constructor(status, code, description, metadata){
        super();
        this.status = status;
        this.code = code;
        this.desc = description;
        this.data = metadata;
    }
}

module.exports = Response;