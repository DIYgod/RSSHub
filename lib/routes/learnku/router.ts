export default (router) => {
    router.get('/:community/:category?', './topic.js');
};
