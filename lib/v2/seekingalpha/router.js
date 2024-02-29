module.exports = (router) => {
    router.get('/:symbol/:category?', './index');
};
