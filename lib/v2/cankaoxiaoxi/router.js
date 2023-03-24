module.exports = function (router) {
    router.get('/column/:id?', require('./'));
    router.get('/news/:id?', require('./'));
    router.get('/:id?', require('./'));
};
