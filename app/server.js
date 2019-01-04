const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

const { PORT, HTTP_CODES, MONGO_URL, TEST_MONGO_URL} = require('./config');
const { localStrategy, jwtStrategy } = require('../auth/auth.strategy');

const { userRouter } = require('./user/user.router');
const { authRouter } = require('../auth/auth.router');
const { goalRouter } = require('../goals/goal.router');

mongoose.Promise = global.Promise;

const app = express();
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(morgan('common'));
app.use(express.json());
app.use(express.static('./public'));

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/goal', goalRouter);

app.use('*', function (req, res) {
    res.status(HTTP_CODES.NOT_FOUND).json({error: 'Not found.'});
});

let server;
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
                    console.log(`Express server listening on http://localhost:${PORT}/welcome.html'`); //double-check this
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
            server.close(err => {
                if(err) {
                    console.log(err);
                    return reject (err);
                } else {
                console.log ('Express server shut down');
                resolve();
                }
            });
        });
    });
}

if(require.main === module) {
    startServer().catch(err => console.error(err));
}

module.exports = { app, startServer, stopServer};