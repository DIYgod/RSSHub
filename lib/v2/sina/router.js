module.exports = (router) => {
    router.get('/csj', require('./chuangshiji'));
    router.get('/discovery/:type', require('./discovery'));
    router.get('/finance/china/:lid?', require('./finance/china'));
    router.get('/finance/stock/usstock/:cids?', require('./finance/stock/usstock'));
    router.get('/rollnews/:lid?', require('./rollnews'));
    router.get('/sports/:type?', require('./sports'));
};
