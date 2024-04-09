module.exports = function (router) {
    router.get('/comic/:id/:chapterCnt?', require('./comic'));
    router.get('/:domain?/comic/:id/:chapterCnt?', require('./comic'));
    router.get('/subscribe', require('./subscribe'));
};
