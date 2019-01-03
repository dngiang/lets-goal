const mongoose = require('mongoose');
const Joi = require('joi');

const goalSchema = new mongoose.Schema( {
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'}, 
    title:{type: String, required: true},
    content: {type:String, required: true},
    createDate: {type: Date},
    updateDate: {type: Date, default: Date.now}
});

goalSchema.methods.serialize = function () { 
    let user;

    if( typeof this.user.serialize === 'function') {
        user = this.user.serialize();
    } else {
        user = this.user;
    }

    return { 
        id: this._id,
        user: user,
        title: this.title,
        content: this.content,
        createDate: this.createDate,
        updateDate: this.updateDate
    };
};

const GoalJoiSchema = Joi.object().keys({
    user: Joi.string().optional(),
    title: Joi.string().min(1).required(),
    content: Joi.string().min(1).required(),
    createDate: Joi.date().timestamp()
});

const Goal = mongoose.model('goal', goalSchema);

module.exports = {Goal, GoalJoiSchema};