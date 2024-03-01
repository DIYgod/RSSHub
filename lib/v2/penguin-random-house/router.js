module.exports = function (router) {
    router.get('/articles', require('./articles'));
    router.get('/the-read-down', require('./thereaddown'));
};
