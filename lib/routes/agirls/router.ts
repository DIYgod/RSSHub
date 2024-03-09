export default (router) => {
    router.get('/topic/:topic', './topic');
    router.get('/topic_list', './topic-list');
    router.get('/:category?', './index');
};
