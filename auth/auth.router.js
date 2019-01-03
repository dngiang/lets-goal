const express = require('express');
const jwt = require('jsonwebtoken');

const { localPassportMiddleware, jwtPassportMiddleware} = require ('../auth/auth.strategy');
const { JWT_SECRET, JWT_EXPIRY} = require ('../app/config');

const authRouter = express.Router();

function createJwtToken(user) {
    return jwt.sign({ user }, JWT_SECRET, {
        subject: user.username,
        expiresIn: JWT_EXPIRY,
        algorithm: 'HS256'
    });
}

authRouter.post('/login', localPassportMiddleware, (req,res) => {
    const user = req.user.serialize();
    const jwtToken = createJwtToken(user);
    res.json({ jwtToken , user});
});


authRouter.post('/refresh', jwtPassportMiddleware, (req, res) => {
    const user = req.user;
    const jwtToken = createJwtToken(user);
    res.json({jwtToken, user});
});

module.exports = { authRouter };