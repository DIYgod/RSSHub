module.exports = function (router) {
    router.get('/pen0', require('./pen0'));
    router.get('/:category?', require('./index'));
};
