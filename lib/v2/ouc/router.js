module.exports = (router) => {
    router.get('/it/postgraduate', require('./it-postgraduate'));
    router.get('/it/:type?', require('./it'));
    router.get('/yjs', require('./yjs'));
};
