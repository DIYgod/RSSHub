module.exports = function (router) {
    router.get('/activity', require('./activity'));
    router.get('/newsflash', require('./newsflash'));
    router.get('/search/news/:keyword', require('./search_news'));
    router.get('/user/:id', require('./user'));
    router.get('/:id?', require('./post'));
};
