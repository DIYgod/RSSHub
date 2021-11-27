module.exports = function (router) {
    router.get('/find', require('./find'));
    router.get('/portrait', require('./portrait'));
};
