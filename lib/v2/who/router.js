module.exports = (router) => {
    router.get('/news/:language?', require('./news'));
    router.get('/news-room/:category?/:language?', require('./news-room'));
    router.get('/speeches/:language?', require('./speeches'));
};
