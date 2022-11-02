module.exports = function (router) {
    router.get('/entry/:id', require('./entry'));
    router.get('/weekly', require('./weekly'));
};
