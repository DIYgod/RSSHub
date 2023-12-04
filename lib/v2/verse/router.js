module.exports = function (router) {
    router.get('/articles/:category?', require('./articles'));
};
