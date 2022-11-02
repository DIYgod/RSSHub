module.exports = function (router) {
    router.get('/weekly', require('./weekly'));
    router.get('/entry/:id', require('./entry'));
};
