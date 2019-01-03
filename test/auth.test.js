const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jsonwebtoken = require('jsonwebtoken');
const faker = require('faker');

const { HTTP_CODES, JWT_SECRET, JWT_EXPIRY} = require('../app/config');
const {startServer, stopServer, app} = require('../app/server.js');
const { User } = require('../app/user/user.model');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Integration tests for : /api/auth', function () {
    let testUser, jwtToken; 

    before(function () {
        return startServer(true);
    });

    beforeEach( function() {
        testUser = createFakerUser(); 

        return User.hashPassword(testUser.password).then(hashedPassword => {
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
                            algorithm: 'HS256',
                            expiresIn: JWT_EXPIRY,
                            subject: testUser.username
                        }
                    );
                })
            .catch(err => {
                console.error(err);
            });
        });
    });

    afterEach(function () {
        return new Promise((resolve,reject) => {
            mongoose.connection.dropDatabase() 
                .then(result => {
                    resolve(result);
                })
                .catch (err => {
                    console.error(err);
                    reject(err);
                });
            });
        });

    after(function() {
        return stopServer();
    });

    it('Should login correctly and return a valid JSON Web Token', function () {
        return chai.request(app)
            .post('/api/auth/login') 
            .send({
                username: testUser.username,
                password: testUser.password
            })
            .then (res => {
                expect(res).to.have.status(HTTP_CODES.OK);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.be.include.keys('jwtToken');

                const jwtPayload = jsonwebtoken.verify(res.body.jwtToken, JWT_SECRET, {
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

    it('Should resfresh the user JSON Web Token', function () {
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

                const newJwtPayload = jsonwebtoken.verify(res.body.jwtToken, JWT_SECRET, {
                    algorithm: ['HS256']
                });
                expect(newJwtPayload.user).to.be.a('object');
                expect(newJwtPayload.user).to.deep.include ({
                    username: testUser.username,
                    email: testUser.email,
                    name: testUser.name
                });

                expect(newJwtPayload.exp).to.be.at.least(firstJwtPayload.exp);
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