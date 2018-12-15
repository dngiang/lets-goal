const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const {HTTP_CODES} = require('../app/config');
const {startServer, stopServer, app} = require('../app/server.js');
const { User } = require('../app/user/user.model');

const expect = chai.expect;
chai.use(chaiHttp);

describe ('Integration tests for : /api/user', function () {
    let testUser;

    before(function (){
        return startServer(true);
    });

    beforeEach( function () {
        testUser = createFakerUser();

        return User.create(testUser)
            .then(() => { })
            .catch(err => {
                console.error(err);
            });
    });

    afterEach(function () {
        return new Promise ((resolve, reject) => {
            mongoose.connection.dropDatabase()
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
        });
    });

    after(function () {
        return stopServer();
    });

    it('Should create a new user', function () {
        let newUser = createFakerUser();
        return chai.request(app)
            .post('/api/user')
            .send(newUser)
            .then( res => {
                expect(res).to.have.status(HTTP_CODES.CREATED);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('id', 'name','username','email');
                expect(res.body.name).to.equal(newUser.name);
                expect(res.body.email).to.equal(newUser.email);
                expect(res.body.username).to.equal(newUser.username);
            });
    });

    function createFakerUser() {
        return {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            username: `${faker.lorem.word()} ${faker.random.number(100)}`,
            password: faker.internet.password(),
            email: faker.internet.email()
        };
    }
});