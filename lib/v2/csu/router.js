module.exports = function (router) {
    router.get('/cse/:type?', require('./cse'));
    router.get('/job/:type?', require('./job'));
    router.get('/mail/:type?', require('./mail'));
};
