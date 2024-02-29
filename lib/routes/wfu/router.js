module.exports = (router) => {
    router.get('/jwc', './jwc');
    router.get('/news/:type?', './news');
};
