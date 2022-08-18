module.exports = (router) => {
    router.get('/news/:category?', require('./news/highlights/news.js'));
    router.get('/news/military/hot', require('./news/military/news.js'));
};
