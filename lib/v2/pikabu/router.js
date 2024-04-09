module.exports = (router) => {
    router.get('/user/:name', require('./user'));
    router.get('/:type/:name', require('./community'));
};
