module.exports = function (router) {
    router.get('/author/:uid', require('./author'));
    router.get('/course/:tag', require('./course'));
};
