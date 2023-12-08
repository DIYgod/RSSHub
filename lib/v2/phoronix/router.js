module.exports = (router) => {
    router.get('/:category?/:topic?', require('./index'));
};
