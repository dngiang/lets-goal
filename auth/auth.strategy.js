const passport = require('passport');
const { Strategy : LocalStrategy} = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');


const {User} = require('../app/user/user.model');
const {JWT_SECRET} = require('../app/config');

const localStrategy = new LocalStrategy((username, password, passportVerify) => {
    let user;

    User.findOne({ username: username}).then(_user => { 
        user = _user;
        if (!user) {
            return Promise.reject({
                reason:'LoginError',
                message:'Incorrect username or password'
            });
        }
        return user.validatePassword(password);
    }).then(isValid => {
        if(!isValid) {
            return Promise.reject({
                reason:'LoginError',
                message:'Incorrect username or password'
            });
        }
        return passportVerify(null, user);
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

const localPassportMiddleware = passport.authenticate('local', {session: false});
const jwtPassportMiddleware = passport.authenticate('jwt', {session: false});

module.exports = {
    localStrategy,
    jwtStrategy,
    localPassportMiddleware,
    jwtPassportMiddleware
};