const express = require('express');
const Joi = require('joi');

const {HTTP_CODES} = require('../config');
const { User, UserJoiSchema} = require('./user.model');

const userRouter = express.Router();

userRouter.post('/', (req,res) => { //create a new user
    const newUser = { //in server.js, we did express.json() to parse the body
        name:req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    };

    const validation = Joi.validate(newUser, UserJoiSchema) //we did validation in user.modell.js
    if (validation.error) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({ error: validation.error }); //compare and show err or not show err
    }

    User.findOne({ 
        //check if the username and user already exist
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

        User.create(newUser) //creating new user
            .then(createdUser => {
                return res.status(HTTP_CODES.CREATED).json(createdUser.serialzier()); //serialize. never return raw mongodb data
            })
            .catch(error => {
                console.error(error);
                return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({error: error.messge});
            });
    });
});

userRouter.get('/', (req,res) => { //retrieving all users
    User.find()
        .then(users => {
            return res.status(HTTP_CODES.OK).json(
                users.map(user => user.serialize()) //map the array and return all serialized
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