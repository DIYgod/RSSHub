module.exports = (router) => {
    router.get('/convert/:query?', require('./convert'));
    router.get('/disclosure/:query?', require('./disclosure'));
    router.get('/inquire', require('./inquire'));
    router.get('/lawandrules/:slug?', require('./lawandrules'));
    router.get('/renewal', require('./renewal'));
};
