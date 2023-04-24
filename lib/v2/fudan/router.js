module.exports = function (router) {
    router.get('/gsao/:type', require('./gsao'));
};
