module.exports = (router) => {
    router.get('/dynamic/:userId/:pagesize?', require('./tapechat'));
    router.get('/questionbox/:sharecode/:pagesize?', require('./tapechat_questions'));
};
