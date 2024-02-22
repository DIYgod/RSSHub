module.exports = function (router) {
    router.get('/latest/:category?', require('./index'));
};
