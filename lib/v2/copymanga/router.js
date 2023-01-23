module.exports = (router) => {
    router.get('/comic/:id/:chapterCnt?', require('./comic'));
};
