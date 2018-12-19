const chai = require('chai');
const chaiHttp = require('chai-http');

const { HTTP_CODES } = require('../app/config');
const {startServer, stopServer, app} = require('../app/server.js');
const expect = chai.expect; //extract chai.expect into a variable
chai.use(chaiHttp); //enable chai to test against HTTP express app

describe ('Integration tests for: /', function() { //this is a MOCHA HOOK: Runs before ALL the 'it' test blocks
    before(function() {
        return startServer(true); //start server before tests or else it will crash
    });
    after(function () {
        return stopServer(); //since we dont need it anymore
    });

    it('Should return welcome.html', function() {
        chai.request(app)
            .get('/')
            .then( res => {
                expect(res).to.have.status(HTTP_CODES.OK);
                expect(res).to.be.html;
                expect(res.text).to.have.string('<!DOCTYPE html>');
            });
    });
}); 