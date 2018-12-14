const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose'); //connect to mongo db
const passport = require('passport');

const { PORT, HTTP_CODES, MONGO_URL} = require('./config');
const { localStrategy, jwtStrategy } = require('../auth/auth.strategy'); //we need to tell passport to .use in order to activate it

const { userRouter } = require('./user/user.router');
const { authRouter } = require('../auth/auth.router');
const { goalRouter } = require('../goals/goal.router');

let server;

const app = express(); //create app for express
passport.use(localStrategy);
passport.use(jwtStrategy);

//middleware, intercept calls b4 they get to the server
app.use(morgan('combined'));
app.use(express.json()); //access the body content inside express
app.use(express.static('./public'));

app.use('/api/user', userRouter); //setting the user route for userRouter in user.router.js module.exports, dbs for server code ONLY, no public folder
app.use('/api/auth', authRouter);
app.use('/api/goal', goalRouter);

app.use('*', (req, res) => {
    res.status(HTTP_CODES.NOT_FOUND).json({
        error: 'Not found.'
    })
});

function startServer(testEnv) {

    return new Promise((resolve, reject) => {
        let mongoUrl;

        if (testEnv) {
            mongoUrl = TEST_MONGO_URL;
        } else {
            mongoUrl = MONGO_URL;
        }
        mongoose.connect(mongoUrl, { useNewUrlParser: true }, err => {
            if (err) {
                console.error(err);
                return reject(err);
            } else {
                server = app.listen(PORT, () => {
                    console.log(`Express server listening on http://localhost:${PORT}`);
                    resolve();
                }).on('error', err => {
                    mongoose.disconnect();
                    console.error(err);
                    reject(err);
                });
            }
        });
    });
}

function stopServer() {
    return mongoose.disconnect().then(() => {
        return new Promise ((resolve, reject) => {
            server.close(err => {  //only possible because server is a glocal variable from previous assignment
                if(err) {
                    console.log(err);
                    return reject (err);
                }
                console.log ('Express server shut down');
                resolve();
            });
        });
    });
}

module.exports = { app, startServer, stopServer};