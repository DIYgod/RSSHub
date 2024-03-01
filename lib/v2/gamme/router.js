module.exports = (router) => {
    router.get('/:domain/:category?', require('./category'));
    router.get('/:domain/tag/:tag', require('./tag'));
};
