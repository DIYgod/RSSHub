export default (router) => {
    router.get('/comic/:id/:chapterCnt?', './comic');
};
