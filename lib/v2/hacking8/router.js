module.exports = function (router) {
    router.get('/search/:keyword?', require('./search'));
    router.get('/:category?', require('./index'));
};
