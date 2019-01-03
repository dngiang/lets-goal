const express = require('express');
const Joi = require('joi');

const {HTTP_CODES} = require('../config');
const { User, UserJoiSchema} = require('./user.model');

const userRouter = express.Router();

userRouter.post('/', (req,res) => {
    const newUser = { 
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    };

    const validation = Joi.validate(newUser, UserJoiSchema)
    if (validation.error) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({ error: validation.error });
    }

    User.findOne({ 
        $or: [
            { email: newUser.email },
            { username: newUser.username} 
        ]
    }).then(user => {
        if (user) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({ error: 'Database error: already exist'});
    }
        return User.hashPassword(newUser.password);
    }).then(passwordHash => {
        newUser.password = passwordHash;

        User.create(newUser)
            .then(createdUser => {
                return res.status(HTTP_CODES.CREATED).json(createdUser.serialize());
            })
            .catch(error => {
                console.error(error);
                return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({error: error.message});
            });
    });
});

userRouter.get('/', (req,res) => {
    User.find()
        .then(users => {
            return res.status(HTTP_CODES.OK).json(
                users.map(user => user.serialize())
            );
        })
        .catch(error => {
            return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json(error);
        });
});

userRouter.get('/:userid', (req,res) => {
    User.findById(req.params.userid)
        .then(user => {
            return res.status(HTTP_CODES.OK).json(user.serialize());
        })
        .catch(error => {
            return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json(error);
        });
});

module.exports = { userRouter };