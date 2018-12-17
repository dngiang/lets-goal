const mongoose = require('mongoose');

const chai = require('chai');

const chaiHttp = require('chai-http');
const jsonwebtoken = require('jsonwebtoken');
const faker = require('faker');

const { HTTP_STATUS_CODES, JWT_SECRET, JWT_EXPIRY } = require('../app/config');
const { startServer, stopServer, app } = require('../app/server.js');
const { User } = require('../app/user/user.model');
const { Goal } = require('../goals/goal.model');

const expect = chai.expect;
chai.use(chaiHttp); 

describe('Integration tests for: /api/goal', function () {
    let testUser, jwtToken;


    before(function () {

        return startServer(true);
    });


    beforeEach(function () {
        testUser = createFakerUser();

        return User.hashPassword(testUser.password)
            .then(hashedPassword => {

                return User.create({
                    name: testUser.name,
                    email: testUser.email,
                    username: testUser.username,
                    password: hashedPassword
                }).catch(err => {
                    console.error(err);
                    throw new Error(err);
                });
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

                const seedData = [];
                for (let i = 1; i <= 10; i++) {
                    const newGoal = createFakerGoal();
                    newGoal.user = createdUser.id;
                    seedData.push(newGoal);
                }
                return Goal.insertMany(seedData)
                    .catch(err => {
                        console.error(err);
                        throw new Error(err);
                    });
            });
    });


    afterEach(function () {

        return new Promise((resolve, reject) => {

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

    it('Should return user goals', function () {
        return chai.request(app)
            .get('/api/goal')
            .set('Authorization', `Bearer ${jwtToken}`)
            .then(res => {
                expect(res).to.have.status(HTTP_STATUS_CODES.OK);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.lengthOf.at.least(1);
                const note = res.body[0];
                expect(note).to.include.keys('user', 'title', 'content');
                expect(note.user).to.be.a('object');
                expect(note.user).to.include.keys('name', 'email', 'username');
                expect(note.user).to.deep.include({
                    id: testUser.id,
                    username: testUser.username,
                    email: testUser.email,
                    name: testUser.name
                });
            });
    });

    it('Should return a specific goal', function () {
        let foundGoal;
        return Goal.find()
            .then(goals => {
                expect(goals).to.be.a('array');
                expect(goals).to.have.lengthOf.at.least(1);
                foundGoal = goals[0];

                return chai.request(app)
                    .get(`/api/goal/${foundGoal.id}`)
                    .set('Authorization', `Bearer ${jwtToken}`);
            })
            .then(res => {
                expect(res).to.have.status(HTTP_STATUS_CODES.OK);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('user', 'title', 'content');
                expect(res.body).to.deep.include({
                    id: foundGoal.id,
                    title: foundGoal.title,
                    content: foundGoal.content
                });
            });
    });

    it('Should update a specific goal', function () {
        let goalToUpdate;
        const newGoalData = createFakerGoal();
        return Goal.find()
            .then(goals => {
                expect(goals).to.be.a('array');
                expect(goals).to.have.lengthOf.at.least(1);
                goalToUpdate = goals[0];

                return chai.request(app)
                    .put(`/api/note/${goalToUpdate.id}`)
                    .set('Authorization', `Bearer ${jwtToken}`)
                    .send(newGoalData);
            })
            .then(res => {
                expect(res).to.have.status(HTTP_STATUS_CODES.NO_CONTENT);

                return Goal.findById(goalToUpdate.id);
            })
            .then(goal => {
                expect(goal).to.be.a('object');
                expect(goal).to.deep.include({
                    id: goalToUpdate.id,
                    title: newGoalData.title,
                    content: newGoalData.content
                });
            });
    });

    it('Should delete a specific goal', function () {
        let goalToDelete;
        return Goal.find()
            .then(goals => {
                expect(goals).to.be.a('array');
                expect(goals).to.have.lengthOf.at.least(1);
                goalToDelete = goals[0];

                return chai.request(app)
                    .delete(`/api/goal/${goalToDelete.id}`)
                    .set('Authorization', `Bearer ${jwtToken}`);
            })
            .then(res => {
                expect(res).to.have.status(HTTP_STATUS_CODES.NO_CONTENT);

                return Goal.findById(goalToDelete.id);
            })
            .then(goal => {
                expect(goal).to.not.exist;
            });
    });

    function createFakerUser() {
        return {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            username: `${faker.lorem.word()}${faker.random.number(100)}`,
            password: faker.internet.password(),
            email: faker.internet.email()
        };
    }

    function createFakerGoal() {
        return {
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraphs()
        };
    }
});