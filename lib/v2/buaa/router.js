module.exports = (router) => {
    router.get('/sme/:type?', require('./sme'));
};
