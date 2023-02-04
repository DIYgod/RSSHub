module.exports = (router) => {
    router.get('/cn/family_offers', require('./cn/family_offers'));
    router.get('/cn/low_price', require('./cn/low_price'));
    router.get('/cn/new', require('./cn/new'));
    router.get('/gb/new', require('./gb/new'));
    router.get('/gb/offer', require('./gb/offer'));
};
