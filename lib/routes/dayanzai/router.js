export default (router) => {
    router.get('/:category/:fulltext?', './index');
};
