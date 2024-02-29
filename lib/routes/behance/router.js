module.exports = (router) => {
    router.get('/:user/:type?', './user');
};
