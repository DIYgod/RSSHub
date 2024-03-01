module.exports = function (router) {
    router.get('/book', require('./book'));
    router.get('/essay', require('./essay'));
    router.get('/exhibition', require('./exhibition'));
};
