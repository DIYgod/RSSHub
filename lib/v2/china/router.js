module.exports = (router) => {
    router.get('/news/military', require('./news/military/news.js'));
    router.get('/news/:category?', require('./news/highlights/news.js'));
    router.get('/finance/:category?/:limit?', require('./finance/finance.js'));
};
