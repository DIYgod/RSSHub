module.exports = function (router) {
    router.get('/yjxw/:category?', require('./yjxw'));
    router.get(/\/yjxx([\w-/]+)?/, require('./yjxx'));
};
