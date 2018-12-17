const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jsonwebtoken = require('jsonwebtoken');
const faker = require('faker');

const { HTTP_CODES, JWT_SECRET, JWT_EXPIRY} = require('./api/config'); //look for this end point
const {startServer, stopServer, app} = require('../app/server.js');
const { User } = require('../app/user/user.model');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Integration tests for : /api/auth', function () {
    let testUser, jwtToken; 

    before(function () {
        return startServer(true);
    });
    after(function() {
        return stopServer();
    });

    beforeEach( function() {
        testUser = createFakerUser(); //create a fakeUser object and manually stored the fake user into mongodb

        return User.hashPassword(testUser.password).then(hashedPassword => { //look at this

            return User.create({
                name: testUser.name,
                email: testUser.email,
                username: testUser.username,
                password: hashedPassword
            })
                .then(createdUser => {
                    testUser.id = createdUser.id;

                    jwtToken = jsonwebtoken.sign(
                        {
                            user: {
                                id: testUser.id,
                                name: testUser.name,
                                email: testUser.email,
                                username: testUser.username
                            }
                        },
                        JWT_SECRET,
                        {
                            algorith: 'HS256',
                            expiresIn: JWT_EXPIRY,
                            subject: testUser.username
                        }
                    );
                });
            })
            .catch(err => {
                console.error(err);
            });
        });
    });

    afterEach(function () {
        return new Promise((resolve,reject) => { //return new Promise or else Mocha wont know to stop running
            mongoose.connection.dropDatabase() //delete the entire db so there is no leftovers from previous test run
                .then(result => {
                    resolve(result);
                })
                .catch (err => {
                    console.error(err);
                    reject(err);
                });
            });
        });

    it('Should login correctly and return a valid JSON Web Token', function () {
        return chai.request(app)
            .post('/api/auth/login') //must match with authRouter!
            .send({
                username: testUser.username,
                password: testUser.password
            })
            .then (res => {
                expect(res).to.have.status(HTTP_CODES.OK);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.be.include.keys('jwtToken');

                const jwtPayload = jsonwebtoke.verify(res.body.jwtToken, JWT_SECRET, {
                    algorithm: ['HS256']
                });
                expect(jwtPayload.user).to.be.a('object');
                expect(jwtPayload.user).to.deep.include ({
                    username: testUser.username,
                    email: testUser.email,
                    name: testUser.name
                });
            });
    });

    it('Should resfresh the user JSON Web Token', function () { //because we already have jwtToken for refresh
        const firstJwtPayload = jsonwebtoken.verify(jwtToken, JWT_SECRET, {
            algorithm: ['HS256']
        });
        return chai.request(app)
            .post('/api/auth/refresh')
            .set('Authorization', `Bearer ${jwtToken}`)
            .then (res => {
                expect(res).to.have.status(HTTP_CODES.OK);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.be.include.keys('jwtToken');

                const newJwtPayload = jsonwebtoke.verify(res.body.jwtToken, JWT_SECRET, {
                    algorithm: ['HS256']
                });
                expect(jwtPayload.user).to.be.a('object');
                expect(jwtPayload.user).to.deep.include ({
                    username: testUser.username,
                    email: testUser.email,
                    name: testUser.name
                });

                expect(newJwtPayload.exp).to.be.at.least(firstJwtPayload);
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