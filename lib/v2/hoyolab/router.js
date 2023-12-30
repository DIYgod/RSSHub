module.exports = (router) => {
    router.get('/news/:language/:gids/:type/:size?', require('./news'));
};
