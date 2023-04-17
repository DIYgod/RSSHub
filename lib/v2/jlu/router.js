module.exports = function (router) {
    router.get('/zsb/:type', require('./zsb'));
};
