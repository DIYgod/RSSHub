module.exports = (router) => {
    router.get('/c/:username/:embed?', require('./custom'));
    router.get('/channel/:id/:embed?', require('./channel'));
    router.get('/charts/:category?/:country?/:embed?', require('./charts'));
    router.get('/community/:handle', require('./community'));
    router.get('/playlist/:id/:embed?', require('./playlist'));
    router.get('/subscriptions/:embed?', require('./subscriptions'));
    router.get('/user/:username/:embed?', require('./user'));
};
