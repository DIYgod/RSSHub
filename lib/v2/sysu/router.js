module.exports = function (router) {
    router.get('/cse', require('./cse'));
    router.get('/graduate/:type', require('./graduate'));
};
