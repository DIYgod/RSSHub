module.exports = function (router) {
    router.get('/24/:category?', require('./24'));
    router.get('/portrait', require('./portrait'));
    router.get('/sh', require('./sh'));
};
