const chai = require('chai');
const chaiString = require('chai-string');
chai.use(chaiString);
const expect = chai.expect;
const beautify = require('json-beautify');
const json = (obj) => beautify(obj,null,2,100);

describe('Response Model Tests', ()=>{
  const Response = require('../src/express-response');

  describe('success response', ()=>{
    it('returns status 200 by default',()=>{
      const response = new Response();
      expect(response.statusCode).to.equal(200);
    });
    it('returns results in the result field', ()=>{
      const response = new Response();
      response.setResult({ foo: 'bar' });
      expect(response.result).to.not.be.undefined;
    });
    it('result can be anything (object)', ()=>{
      const response = new Response();
      response.setResult({ foo: 'bar' });
      expect(response.result).to.be.an('object');
    });
    it('result can be anything (array)', ()=>{
      const response = new Response();
      response.setResult([0,1,2]);
      expect(response.result).to.be.an('array');
    });
    it('result can be anything (string)', ()=>{
      const response = new Response();
      response.setResult('a string');
      expect(response.result).to.be.a('string');
    });
    it('result can be anything (number)', ()=>{
      const response = new Response();
      response.setResult(123);
      expect(response.result).to.be.a('number');
    });
  });

  describe('error response', () =>{
    it('does not return status 200', ()=>{
      const response = new Response();
      response.error('an error');
      expect(response.statusCode).to.not.equal(200);
    });
    it('returns errors in the error field', ()=>{
      const response = new Response();
      response.error('an error');
      expect(response.errors).to.not.be.undefined;
      expect(response.errors).to.be.an('array');
      expect(response.errors).to.have.lengthOf(1);
    });
    it('supports returning multiple errors',()=>{
      const response = new Response();
      response.error('an error');
      response.error('another error');
      expect(response.errors).to.not.be.undefined;
      expect(response.errors).to.be.an('array');
      expect(response.errors).to.have.lengthOf(2);    
    });
    it('does not allow duplicate errors',()=>{
      const response = new Response();
      response.error('an error');
      response.error('an error');
      expect(response.errors).to.not.be.undefined;
      expect(response.errors).to.be.an('array');
      expect(response.errors).to.have.lengthOf(1);    
    });
    it('allows to specify status code',()=> {
      const response = new Response();
      response.error(400, 'an error');
      expect(response.statusCode).to.equal(400);
    });
    it('will always report the highest value status code',()=> {
      const response = new Response();
      response.error(500, 'an error');
      response.error(400, 'another error');
      expect(response.statusCode).to.equal(500);
    });
    it('status codes included in response payload',()=> {
      const response = new Response();
      response.error(401, 'an error');
      response.error(402, 'another error');
      expect(response.errors[0].status).to.equal(401);
      expect(response.errors[1].status).to.equal(402);
    });
    it('only includes errors you specify', ()=>{
      const response = new Response();
      response.error(401, 'an error');
      response.error(402, 'another error');   

      const testError = new Error('some error occurrs');
      const barf = () => {throw testError};   
      expect(barf).to.throw(testError);
      
      expect(response.errors).to.have.lengthOf(2);
    });
    it('unless you specify it to include unhandled errors', () =>{
      // todo
    });
    it('allows you to specify an error code', ()=>{
      const response = new Response();
      response.error(400, 'Bad Request', 'an error description');
      expect(response.errors[0].code).to.exist;
      expect(response.errors[0].code).to.have.string('Bad Request');   
    });
    it('does not allow duplicate error codes to be used', ()=>{
      const response = new Response();
      response.error(400, 'My Custom Error Code', 'a bad thing happened');
      response.error(401, 'My Custom Error Code', 'a different bad thing happened');
      expect(response.errors).to.have.lengthOf(1);
    });
    it('does allow duplicate status codes to be used', ()=>{
      const response = new Response();
      response.error(400, 'My Custom Error Code 1', 'a bad thing happened');
      response.error(400, 'My Custom Error Code 2', 'a different bad thing happened');
      expect(response.errors).to.have.lengthOf(2);
    });
    it('allows attaching your own metadata', ()=>{
      const response = new Response();
      response.error(400, 'Bad Request', 'an error description', { controller: 'myController', app: 'myApp' });
      expect(response.errors[0].data).to.not.be.undefined;
    });
    it('has convenience methods for common errors', ()=>{
      const response = new Response();
      response.errorBadRequest();
      response.errorForbidden()
      response.errorGatewayTimeout();
      response.errorInternalServerError();
      response.errorMethodNotAllowed();
      response.errorTooEarly();
      expect(response.errors).to.have.lengthOf(6);
    })
  });

  describe('info response', () =>{
    it('does not affect status code', ()=>{
      const response = new Response();
      expect(response.statusCode).to.equal(200); // response is success by default
      
      response.information('some useful info');
      expect(response.statusCode).to.equal(200); // should still be success
      
      response.error('oops there was an error');
      expect(response.statusCode).to.not.equal(200); // no longer success
    });
    it('returns infos in the info field', ()=>{
      const response = new Response();
      response.information('some info');
      expect(response.info).to.not.be.undefined;
      expect(response.info).to.be.an('array');
      expect(response.info).to.have.lengthOf(1);
    });
    it('supports returning multiple infos',()=>{
      const response = new Response();
      response.information('not an error');
      response.information('also not an error');
      expect(response.info).to.not.be.undefined;
      expect(response.info).to.be.an('array');
      expect(response.info).to.have.lengthOf(2);    
    });
    it('does not allow duplicate info',()=>{
      const response = new Response();
      response.information('dupe info');
      response.information('dupe info');
      expect(response.info).to.not.be.undefined;
      expect(response.info).to.be.an('array');
      expect(response.info).to.have.lengthOf(1);    
    });
    it('allows you to specify an info code', ()=>{
      const response = new Response();
      response.information('INFO_01', 'an informative description');
      expect(response.info[0].code).to.exist;
      expect(response.info[0].code).to.have.string('INFO_01');   
    });
    it('does not allow duplicate info codes to be used', ()=>{
      const response = new Response();
      response.information('My Custom info Code', 'a bad thing happened');
      response.information('My Custom info Code', 'a different bad thing happened');
      expect(response.info).to.have.lengthOf(1);
    });
    it('allows attaching your own metadata', ()=>{
      const response = new Response();
      response.information('an info description', { controller: 'myController', app: 'myApp' });
      expect(response.info[0].data).to.not.be.undefined;
    });
  });

  describe('advanced usage', () =>{

    it('supports nesting', ()=> {
      const response = new Response();
      let outerError = response.errorBadRequest();
      outerError.errorBadRequest('missing userId');
      outerError.errorBadRequest('missing productId');
      outerError.information('customer object did not include id, will assume insert');

      expect(json(response)).to.equalIgnoreSpaces(`
      {
        "errors": [
          {
            "status": 400,
            "code": "Bad Request",
            "desc": "the request body was missing or malformed",
            "errors": [
              { "status": 400, "code": "Bad Request", "desc": "missing userId" },
              { "status": 400, "code": "Bad Request", "desc": "missing productId" }
            ],
            "info": [ { "desc": "customer object did not include id, will assume insert" } ]
          }
        ]
      }`);
    });
    
    it('express-response does all the things', ()=>{
      const response = new Response();
      response.errorBadRequest('the request body was missing userId');
      response.errorBadRequest('the request body was missing productId');
      response.information('NON_OPTIMAL_JSON', 'the request body contained unneeded spaces or newline characters');
      response.results("nope, not needed because your request was wack, but heres a result anyway");      

      expect(response.hasError).to.be.true;
      expect(response.hasInfo).to.be.true;
      expect(response.hasResult).to.be.true;
      expect(response.statusCode).to.equal(400);
      
      expect(json(response)).to.equalIgnoreSpaces(`
      {
        "errors": [
          { "status": 400, "code": "Bad Request", "desc": "the request body was missing userId" },
          { "status": 400, "code": "Bad Request", "desc": "the request body was missing productId" }
        ],
        "info": [
          {
            "code": "NON_OPTIMAL_JSON",
            "desc": "the request body contained unneeded spaces or newline characters"
          }
        ],
        "result": "nope, not needed because your request was wack, but heres a result anyway"
      }`);
    });

  });

});
