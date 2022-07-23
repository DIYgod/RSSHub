module.exports = function (router) {
    router.get('/the-read-down', require('./thereaddown'));
    router.get('/articles', require('./articles'));
};
