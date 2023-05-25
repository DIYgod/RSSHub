module.exports = (router) => {
    router.get('/master/:type', require('./master'));
};
