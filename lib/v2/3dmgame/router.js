module.exports = (router) => {
    router.get('/news/:category?', require('./news-center'));
    router.get('/:name/:type?', require('./game'));
};
