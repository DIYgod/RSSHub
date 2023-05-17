module.exports = (router) => {
    router.get('/bbs/profile/thread/:userId', require('./profile/thread'));
    router.get('/bbs/special/:specialId', require('./special'));
};
