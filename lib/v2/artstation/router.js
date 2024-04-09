module.exports = (router) => {
    router.get('/:handle', require('./user'));
};
