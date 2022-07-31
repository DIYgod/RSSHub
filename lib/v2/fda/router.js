module.exports = function (router) {
    router.get('/cdrh/:cate*', require('./cdrh'));
};
