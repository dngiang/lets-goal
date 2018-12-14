const express = require('express');
const jwt = require('jsonwebtoken');

const { localPassportMiddleware, jwtPassportMiddleware} = require ('../auth/auth.strategy');
const { JWT_SECRET, JWT_EXPIRY} = require ('../app/config');

const authRouter = express.Router();

function createJwtToken(user) { //sign a new token with the following parameters
    return jwt.sign({ user }, JWT_SECRET, {
        subject: user.username,
        expiresIn: JWT_EXPIRY,
        algorithm: 'HS256'
    });
}

//if user is valid and accurate then we will log in the user by giving them the jwtToken
authRouter.post('/login', localPassportMiddleware, (req,res) => {
    const user = req.user.serialize();
    const jwtToken = createJwtToken(user);
    res.json({ jwtToken , user});
});

// a token have expiration date, expecting user to pass jwt rather than the username and pw
authRouter.post('/refresh', jwtPassportMiddleware, (req, res) => {
    const user = req.user;
    const jwtToken = createJwtToken(user);
    res.json({jwtToken, user});
});

module.exports = { authRouter };