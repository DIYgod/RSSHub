module.exports = (router) => {
    router.get('/:user/:type?', require('./user'));
};
