module.exports = (router) => {
    router.get('/:user/:routeParams?', require('./index'));
};
