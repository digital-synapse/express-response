const { assert } = require('chai');
const chai = require('chai');
const chaiString = require('chai-string');
chai.use(chaiString);
const expect = chai.expect;

// hide noise from any logging happening
const noop = ()=>{};
console.log = noop;
console.error = noop;

describe('Express Integration Tests', ()=>{

  var request = require('supertest');
  describe('loading express', function () {
    var server;
    beforeEach(function () {
      server = require('./mocks/test-server');
    });
    afterEach(function () {
      server.close();
    });
    it('responds to /', (done) => {
      request(server)
        .get('/')
        .expect(200)
        .then(res => {
          expect(res).to.have.a.property('body');
          expect(res.body).to.have.a.property('result');
          expect(res.body.result).to.equal('ok');
        })
        .then(done);
    });
    it('404 everything else', (done) => {
      request(server)
        .get('/foo/bar')
        .expect(404)
        .then(res => {
          //expect(res.body.errors).to.not.be.undefined;
          //expect(res.body.errors).to.have.lengthOf(1);
          //expect(res.body.errors[0].status).to.equal(404);
        })
        .then(done);
    });

    it('success response is well formed', (done) => {
      request(server)
        .post('/echo')        
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({a: 123, b: 'str'}))
        .expect(200)
        .then(res => {
          expect(res.body.result).to.not.be.undefined;
          expect(res.body.result.a).to.equal(123);
          expect(res.body.result.b).to.equal('str');
          expect(res.body.info).to.not.be.undefined;
        })
        .then(done);
    });

    it('failure response is well formed when error was unhandled', (done)=>{
      request(server)
        .get('/unhandled-error')
        .expect(500)
        .then(res => {
          expect(res.body.errors).to.not.be.undefined;
        })
        .then(done);
    });

    it('failure response is well formed when error was handled', (done)=>{
      request(server)
        .get('/handled-error')
        .expect(500)
        .then(res => {
          expect(res.body.errors).to.not.be.undefined;
        })
        .then(done);
    });

    it('failure response includes multiple validation errors', (done)=>{
      request(server)
        .get('/mixed-error-unhandled')
        .expect(500) // still 500 since server doesn't specify when error is thrown
        .then(res => {
          expect(res.body.errors).to.not.be.undefined;
          expect(res.body.errors).to.have.lengthOf(3);
        })
        .then(done);
    }); 
    
    it('failure response is well formed when unhandled', (done)=>{
      request(server)
        .get('/mixed-error-response-unhandled')
        .expect(400)
        .then(res => {
          expect(res.body.errors).to.not.be.undefined;
          expect(res.body.errors).to.have.lengthOf(2);
        })
        .then(done);
    });     
    it('success response well formed when handled', (done)=>{
      request(server)
        .get('/success-handled')
        .expect(200) 
        .then(res => {
          expect(res.body.errors).to.be.undefined;
          expect(res.body.info).to.not.be.undefined;
          expect(res.body.result).to.not.be.undefined;
        })
        .then(done);
    }); 

    it('success response well formed when unhandled', (done)=>{
      request(server)
        .get('/success-unhandled')
        .expect(200) 
        .then(res => {
          expect(res.body.errors).to.be.undefined;
          expect(res.body.info).to.not.be.undefined;
          expect(res.body.result).to.not.be.undefined;
        })
        .then(done);
    }); 

    it('success response well formed when unhandled in async route', (done)=>{
      request(server)
        .get('/success-unhandled-async')
        .expect(200) 
        .then(res => {
          expect(res.body.errors).to.be.undefined;
          expect(res.body.info).to.not.be.undefined;
          expect(res.body.result).to.not.be.undefined;
        })
        .then(done);
    });     

    it('error response well formed when unhandled in async route inside promise', (done)=>{
      request(server)
        .get('/error-unhandled-async')
        .expect(500) 
        .then(res => {
          expect(res.body.errors).to.not.be.undefined;
          expect(res.body.info).to.not.be.undefined;
          expect(res.body.result).to.not.be.undefined;
        })
        .then(done);
    });    

    it('error response well formed when unhandled in async route inside resolved promise', (done)=>{
      request(server)
        .get('/error-unhandled-async2')
        .expect(500)
        .then(res =>{
          expect(res.statusCode).to.equal(500)
          expect(res.body.errors).to.have.lengthOf(1)
        })
        .then(done)
    });    

  });

});