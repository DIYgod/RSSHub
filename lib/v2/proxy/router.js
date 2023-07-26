module.exports = (router) => {
    router.get('/html/:url/:routeParams', require('./html'));
    router.get('/json/:url/:routeParams', require('./json'));
};
