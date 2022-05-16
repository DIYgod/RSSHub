module.exports = function (router) {
    router.get('/author/:uid', require('./author'));
    router.get('/courses/:sort/:tag', require('./courses'));
    router.get('/questions/:id', require('./questions'));
};
