module.exports = (router) => {
    router.get('/:category?', require('./category'));
};
