export default (router) => {
    router.get('/news/:category?', './news-center');
    router.get('/:name/:type?', './game');
};
