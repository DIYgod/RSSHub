module.exports = (router) => {
    router.get('/csj', require('./chuangshiji'));
    router.get('/discovery/:type', require('./discovery'));
    router.get('/finance', require('./finance'));
    router.get('/rollnews', require('./rollnews'));
    router.get('/sports/:type?', require('./sports'));
};
