module.exports = function (router) {
    router.get('/author/:id', require('./author'));
    router.get('/channel/:id?', require('./'));
    router.get('/label/:name', require('./label'));
    router.get('/:id?', require('./'));
};
