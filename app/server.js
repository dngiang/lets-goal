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

function startServer() {
    return new Promise((resolve, reject) => {
        mongoose.connect('MONGO_URL', {useNewUrlParser: true}, err => {
            if (err) {
                console.log(err);
                return reject();
            }
        server = app.listen(PORT, () => {
            console.log(`Express server listening on httpL//localhost:${PORT}`);
        })
        })
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