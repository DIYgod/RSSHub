module.exports = function (router) {
    router.get('/awsblogs/:locale?', require('./awsblogs'));
    router.get('/kindle/software-updates', require('./kindle-software-updates'));
};
