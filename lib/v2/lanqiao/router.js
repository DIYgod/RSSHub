module.exports = function (router) {
    router.get('/author/:uid', require('./author'));
};
