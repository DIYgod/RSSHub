module.exports = function (router) {
    router.get('/actual', require('./actual'));
    router.get('/author/:id', require('./author'));
    router.get('/genre/:id', require('./genre'));
    router.get('/interesting', require('./interesting'));
    router.get('/map', require('./map'));
    router.get('/new', require('./new'));
};
