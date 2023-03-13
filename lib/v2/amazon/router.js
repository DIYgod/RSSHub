module.exports = function (router) {
    router.get('/kindle/software-updates', require('./kindle-software-updates'));
    router.get('/awsblogs/:locale?', require('./awsblogs'));
};
