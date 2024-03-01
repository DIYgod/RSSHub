module.exports = (router) => {
    router.get('/cn/family_offers', require('./cn/family-offers'));
    router.get('/cn/low_price', require('./cn/low-price'));
    router.get('/cn/new', require('./cn/new'));
    router.get('/gb/new', require('./gb/new'));
    router.get('/gb/offer', require('./gb/offer'));
};
