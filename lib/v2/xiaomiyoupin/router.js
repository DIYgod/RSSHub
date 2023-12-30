module.exports = function (router) {
    router.get('/crowdfunding', require('./crowdfunding'));
    router.get('/latest', require('./latest'));
};
