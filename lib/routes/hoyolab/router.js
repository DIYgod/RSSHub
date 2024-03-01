export default (router) => {
    router.get('/news/:language/:gids/:type', './news');
};
