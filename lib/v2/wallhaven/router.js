module.exports = function (router) {
    router.get('/:category', require('./index'));
    router.get('/search/:params', require('./search'));
};
