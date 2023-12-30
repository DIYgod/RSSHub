module.exports = (router) => {
    router.get('/news/:lang?', require('./news'));
    router.get('/news_web_easy', require('./news_web_easy'));
};
