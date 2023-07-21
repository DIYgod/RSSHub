module.exports = (router) => {
    router.get('/news/:category?', require('./news_center'));
    router.get('/:name/:type?', require('./game'));
};
