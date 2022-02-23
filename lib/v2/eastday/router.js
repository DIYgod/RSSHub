module.exports = function (router) {
    router.get('/24/:category?', require('./24'));
    router.get('/find', require('./find'));
    router.get('/portrait', require('./portrait'));
    router.get('/sh', require('./sh'));
};
