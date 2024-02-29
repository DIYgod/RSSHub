module.exports = (router) => {
    router.get('/:language/news/:category?', './news');
};
