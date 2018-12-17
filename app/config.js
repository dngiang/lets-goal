// || is used to check if the PORT exists, if not, return to 8080
module.exports = {

    PORT: process.env.PORT || 8080, //personal preference
    HTTP_CODES : {
        OK: 200,
        CREATED: 201,
        NO_CONTENT:204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },

    MONGO_URL: process.env.MONGO_URL || 'mongodb://testuser:goaling1@ds237574.mlab.com:37574/lets-goal',
    TEST_MONGO_URL: process.env.TEST_MONGO_URL || 'mongodb://testuser:goaling1@ds237574.mlab.com:37574/test-lets-goal',
    JWT_SECRET: process.env.JWT_SECRET || 'default,',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '7d'
};
