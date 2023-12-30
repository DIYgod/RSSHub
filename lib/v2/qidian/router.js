module.exports = (router) => {
    router.get('/author/:id', require('./author'));
    router.get('/chapter/:id', require('./chapter'));
    router.get('/forum/:id', require('./forum'));
    router.get('/free/:type?', require('./free'));
    router.get('/free-next/:type?', require('./free-next'));
};
