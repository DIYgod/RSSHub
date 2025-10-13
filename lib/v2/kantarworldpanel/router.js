module.exports = (router) => {
    router.get('/:region?/:category*', require('./'));
};
