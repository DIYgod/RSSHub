export default (router) => {
    router.get('/finance/:category?', './finance/finance.js');
    router.get('/news/military', './news/military/news.js');
    router.get('/news/:category?', './news/highlights/news.js');
};
