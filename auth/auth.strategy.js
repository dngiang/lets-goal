const passport = require('passport');
const { Strategy : LocalStrategy} = require('passport-local'); //authenticate by providing username and pw
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

//Strategy is a middleware
const {User} = require('../app/user/user.model');
const {JWT_SECRET} = require('../app/config');

const localStrategy = new LocalStrategy((username, password, passportVerify) => {
    let user;

    User.findOne({ username: username}).then(_user => { //check if user exist
        user = _user;
        if (!user) {
            return Promise.reject({
                reason:'LoginError',
                message:'Incorrect username or password'
            });
        }
        return user.validatePassword(password); //testing for pw
    }).then(isValid => {
        if(!isValid) {
            return Promise.reject({
                reason:'LoginError',
                message:'Incorrect username or password'
            });
        }
        return passportVerify(null, user); //testing for user
    }).catch(err => {
        if(err.reason === "LoginError") {
            return passportVerify(null,false, err.message);
        } 
        return passportVerify(err,false);
    });
});

const jwtStrategy = new JwtStrategy(
    {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        algorithms: ['HS256']
    },
    (token, done) => {
        done(null,token.user);
    }
);

// in order to use them, we need to create them and export them
const localPassportMiddleware = passport.authenticate('local', {session: false});
const jwtPassportMiddleware = passport.authenticate('jwt', {session: false});

module.exports = {
    localStrategy,
    jwtStrategy,
    localPassportMiddleware,
    jwtPassportMiddleware
};