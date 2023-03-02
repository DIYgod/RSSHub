module.exports = function (router) {
    router.get('/article/:type?', require('./article'));
    router.get('/today', require('./today'));
};
