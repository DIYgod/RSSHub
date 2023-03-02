module.exports = (router) => {
    router.get('/papers/:perPage?', require('./papers'));
    router.get('/news', require('./news'));
};
