module.exports = (router) => {
    router.get('/cover', require('./cover'));
    router.get('/highlight/:journal?', require('./highlight'));
    router.get('/news', require('./news'));
    router.get('/news-and-comment/:journal?', require('./news-and-comment'));
    router.get('/research/:journal?', require('./research'));
    router.get('/siteindex', require('./siteindex'));
};
