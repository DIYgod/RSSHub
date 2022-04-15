module.exports = function (router) {
    router.get('/blog/:cate?', require('./blog'));
    router.get('/changelog/:language?', require('./changelog'));
};
