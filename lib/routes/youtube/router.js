export default (router) => {
    router.get('/c/:username/:embed?', './custom');
    router.get('/channel/:id/:embed?', './channel');
    router.get('/charts/:category?/:country?/:embed?', './charts');
    router.get('/community/:handle', './community');
    router.get('/live/:username/:embed?', './live');
    router.get('/playlist/:id/:embed?', './playlist');
    router.get('/subscriptions/:embed?', './subscriptions');
    router.get('/user/:username/:embed?', './user');
};
