module.exports = function (router) {
    router.get('/cid/:id?', require('./cid'));
    router.get('/rank/:range?', require('./rank'));
    router.get('/zhibo', require('./cid'));
    router.get('/:category*', require('./'));
};
