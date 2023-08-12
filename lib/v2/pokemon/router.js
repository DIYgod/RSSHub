module.exports = (router) => {
    router.get('/sv/news/:lang?', require('./sv/news'));
};
