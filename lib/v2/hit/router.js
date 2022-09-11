module.exports = function (router) {
    // 哈尔滨工业大学
    router.get('/hitgs', require('./hitgs'));
    router.get('/jwc', require('./jwc'));
    router.get('/today/:category', require('./today'));
};
