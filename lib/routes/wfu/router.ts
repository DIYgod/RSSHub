export default (router) => {
    router.get('/jwc', './jwc');
    router.get('/news/:type?', './news');
};
