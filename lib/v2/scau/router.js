module.exports = (router) => {
    router.get('/yzb', require('./yjs'));
    router.get('/yjsy', require('./yjsy'));
};
