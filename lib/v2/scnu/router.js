module.exports = (router) => {
    router.get('/cs/match', require('./cs/match'));
    router.get('/jw', require('./jw'));
    router.get('/library', require('./library'));
    router.get('/ss', require('./ss'));
    router.get('/yjs', require('./yjs'));
};
