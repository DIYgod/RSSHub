module.exports = function (router) {
    router.get('/jlpt', require('./jlpt'));
    router.get('/:type?', require('./index'));
};
