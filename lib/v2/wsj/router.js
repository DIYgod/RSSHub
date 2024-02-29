module.exports = (router) => {
    router.get('/:lang/:category?', './news');
};
