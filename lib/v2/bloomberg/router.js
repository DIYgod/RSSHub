module.exports = function (router) {
    router.get('/authors/:id/:slug/:source?', './authors');
    router.get('/:site', './index');
    router.get('/', './index');
};
