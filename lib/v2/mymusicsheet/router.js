module.exports = (router) => {
    router.get('/:user', require('./user'));
};
