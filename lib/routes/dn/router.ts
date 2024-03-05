export default (router) => {
    router.get('/:language/news/:category?', './news');
};
