module.exports = (router) => {
    router.get('/papers', require('./papers'));
    router.get('/news', require('./news'));
};
