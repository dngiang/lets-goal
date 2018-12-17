const express = require('express');
const Joi = require('joi');
const goalRouter = express.Router();

const { HTTP_CODES} = require('../app/config');
const {jwtPassportMiddleware} = require ('../auth/auth.strategy');
const { Goal, GoalJoiSchema} = require('./goal.model');


//CREATE NEW GOAL
goalRouter.post('/', jwtPassportMiddleware, (req, res) => { //if token not valid, req will crash
    const newGoal = { //if new goal don't have the follow params, it will throw an err
        user:req.user.id,
        title: req.body.title,
        content: req.body.content,
        createDate: Date.now()
    };

    const validation = Joi.validate(newGoal, GoalJoiSchema); //if no error, then we will create the newGoal
    if(validation.error) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({ error: validation.error});
    }
    Goal.create(newGoal)
        .then(createdUser => {
            return res.status(HTTP_CODES.CREATED).json(createdUser.serialize()); //never forget to serialze
        })
        .catch(error => {
            return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json(error);
        });
});
//RETRIVING USER's GOAL from the current logged in user 1)required jwt, and then pass in the request of user id which is the passport. Only showing notes to the correct user
goalRouter.get('/', jwtPassportMiddleware, (req,res) => {
    Goal.find({user: req.user.id })
        .populate('user')
        .then(goals => {
            return res.status(HTTP_CODES.OK).json(goals.map(goal => goal.serialize())
            );
        })
        .catch(error =>{
            return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json(error);
        });
});

// RETRIEVE ALL GOALS
goalRouter.get('/all', (req, res) => {

    Goal.find()
        .populate('user')
        .then(goals => {
            // Step 2A: Return the correct HTTP status code, and the notes correctly formatted via serialization.
            return response.status(HTTP_CODES.OK).json(
                goals.map(goal => goal.serialize())
            );
        })
        .catch(error => {
            // Step 2B: If an error ocurred, return an error HTTP status code and the error in JSON format.
            return response.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json(error);
        });
});

//RETRIEVE ONE GOAL BY ID; GOOD
goalRouter.get('/:goalid', (req,res) => {
    Goal.findById(req.params.goalid)
    .populate('user')
    .then (goal => {
        return res.status(HTTP_CODES.OK).json(goal.serialize());
    })
    .catch(error => {
        return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json(error);
    });
});

//UPDATING GOAL
goalRouter.put('/:goalid', jwtPassportMiddleware, (req,res) => {
    const goalUpdate = {
        title: req.body.title,
        content: req.body.content
    };

    const validation = Joi.validate(goalUpdate, GoalJoiSchema); //validate it does have title and content by the schema
    if (validation.error){
        return res.status(HTTP_CODES.BAD_REQUEST).json({error: validation.error});
    }
    Goal.findByIdAndUpdate(req.params.godlid, goalUpdate) //update here, goalUpdate
        .then(() => {
            return res.status(HTTP_CODES.NO_CONTENT).end(); //ending the req completely
        })
        .catch(error => {
            return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json(error);
        });
});

//DELETING GOAL
goalRouter.delete('/:goalid', jwtPassportMiddleware, (req,res) => {
    Goal.findByIdAndDelete(req.params.goalid)
        .then(() => {
            return res.status(HTTP_CODES.NO_CONTENT).end();
        })
        .catch(error => {
            return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json(error);
        });
});

module.exports = { goalRouter };