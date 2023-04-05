module.exports = function (router) {
    router.get('/jobs', require('./jobs'));
    router.get('/weekly', require('./weekly'));
};
