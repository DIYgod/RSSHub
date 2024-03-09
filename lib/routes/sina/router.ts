export default (router) => {
    router.get('/csj', './chuangshiji');
    router.get('/discovery/:type', './discovery');
    router.get('/finance/china/:lid?', './finance/china');
    router.get('/finance/stock/usstock/:cids?', './finance/stock/usstock');
    router.get('/rollnews/:lid?', './rollnews');
    router.get('/sports/:type?', './sports');
};
