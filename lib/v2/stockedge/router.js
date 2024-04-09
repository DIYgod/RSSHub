module.exports = (router) => {
    router.get('/daily-updates/news', require('./daily-news'));
};
