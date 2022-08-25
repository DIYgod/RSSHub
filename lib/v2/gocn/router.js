module.exports = function (router) {
    router.get('/', require('./topics'));
    router.get('/jobs', require('./jobs'));
};
