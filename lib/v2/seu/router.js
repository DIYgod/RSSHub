module.exports = (router) => {
    router.get('/cse/:type?', require('./cse'));
    router.get('/radio/academic', require('./radio/academic'));
    router.get('/yjs', require('./yjs'));
    router.get('/yzb/:type', require('./yzb'));
};
