module.exports = function (router) {
    router.get('/news/:region/:category?', require('./news/index'));
};
