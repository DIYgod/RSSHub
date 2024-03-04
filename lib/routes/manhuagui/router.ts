export default (router) => {
    router.get('/comic/:id/:chapterCnt?', './comic');
    router.get('/:domain?/comic/:id/:chapterCnt?', './comic');
    router.get('/subscribe', './subscribe');
};
