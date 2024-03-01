export default (router) => {
    router.get('/:lang/:category?', './news');
};
