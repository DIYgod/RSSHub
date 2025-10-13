module.exports = (router) => {
    router.get('/finance/:category?', require('./finance/finance.js'));
    router.get('/news/military', require('./news/military/news.js'));
    router.get('/news/:category?', require('./news/highlights/news.js'));
};
