module.exports = (router) => {
    router.get('/m/:key/:url', require('./media'));
    router.get('/routes/:lang?', require('./routes'));
    router.get('/transform/html/:url/:routeParams', require('./transform/html'));
    router.get('/transform/json/:url/:routeParams', require('./transform/json'));
    router.get('/transform/sitemap/:url/:routeParams?', require('./transform/sitemap'));
};
