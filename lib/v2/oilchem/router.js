module.exports = (router) => {
    router.get('/:type?/:category?/:subCategory?', require('./'));
};
