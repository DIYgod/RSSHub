module.exports = function (router) {
    router.get('/go/:id?', require('./go'));
    router.get('/jobs', require('./jobs'));
    router.get('/weekly', require('./weekly'));
};
