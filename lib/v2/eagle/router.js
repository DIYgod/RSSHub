module.exports = function (router) {
    router.get('/blog/:cate?/:language?', require('./blog'));
    router.get('/changelog/:language?', require('./changelog'));
};
