module.exports = function (router) {
    router.get('/episodes', require('./episodes'));
    router.get('/index', require('./index'));
};
