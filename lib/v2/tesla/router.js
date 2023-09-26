module.exports = (router) => {
    router.get('/cx/:category?', require('./cx'));
    router.get('/price', require('./price'));
};
