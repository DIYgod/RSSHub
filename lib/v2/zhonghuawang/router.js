module.exports = (router) => {
    router.get('/news/:category?', require('./news/highlights/hotNews.js'));
    router.get('/news/military/hot', require('./news/military/hotNews.js'));
};
