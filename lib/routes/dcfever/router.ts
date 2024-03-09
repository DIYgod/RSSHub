export default (router) => {
    router.get('/news/:type?', './news');
    router.get('/reviews/:type?', './reviews');
    router.get('/trading/search/:keyword/:mainCat?', './trading-search');
    router.get('/trading/:id', './trading');
};
