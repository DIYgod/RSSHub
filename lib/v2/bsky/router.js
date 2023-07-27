module.exports = (router) => {
    router.get('/keyword/:keyword/:routeParams?', require('./keyword'));
};
