module.exports = (router) => {
    router.get('/:symbol/:category?', require('./index'));
};
