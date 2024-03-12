export default (router) => {
    router.get('/news/:sub', './news');
    router.get('/career/:tag', './career');
    router.get('/lrc', './lrc');
    router.get('/fst', './fst');
};
