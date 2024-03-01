module.exports = (router) => {
    router.get('/:category?/:id?', require('./'));
};
