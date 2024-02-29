module.exports = (router) => {
    router.get('/:category?', './news');
};
