module.exports = (router) => {
    router.get('/:routeParams?', require('./index'));
};
