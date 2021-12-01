module.exports = function (router) {
    router.get('/author/:uid', require('./author'));
    router.get('/courses/:tag', require('./courses'));
    router.get('/questions/', require('./questions'));
};
