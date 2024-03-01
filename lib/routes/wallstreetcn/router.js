export default (router) => {
    router.get('/hot/:period?', './hot');
    router.get('/live/:category?/:score?', './live');
    router.get('/news/:category?', './news');
    router.get('/:category?', './news');
};
