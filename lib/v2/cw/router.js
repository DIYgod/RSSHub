module.exports = (router) => {
    router.get('/master/:channel', require('./master'));
    router.get('/sub/:channel', require('./sub'));
    router.get('/today', require('./today'));
};
