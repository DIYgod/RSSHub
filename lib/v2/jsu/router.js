module.exports = (router) => {
    // 创新中心
    router.get('/cxzx/:types?', require('./cxzx'));
    router.get('/rjxy', require('./rjxy'));
    router.get('/stxy', require('./math'));
    router.get('/notice', require('./universityindex'));
    router.get('/jwc/:types?', require('./jwc'));
};
