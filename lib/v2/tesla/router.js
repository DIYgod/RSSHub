module.exports = (router) => {
    router.get('/cx/:category?/:city?', require('./cx'));
    router.get('/price', require('./price'));
};
