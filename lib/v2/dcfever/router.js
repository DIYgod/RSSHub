module.exports = (router) => {
    router.get('/news/:type?', require('./news'));
    router.get('/reviews/:type?', require('./reviews'));
    router.get('/trading/search/:keyword/:mainCat?', require('./trading-search'));
    router.get('/trading/:id', require('./trading'));
};
