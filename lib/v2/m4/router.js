module.exports = (router) => {
    router.get('/:id?/:category*', require('./'));
};
