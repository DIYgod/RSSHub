export default (router) => {
    router.get('/', './index');
    router.get('/:topicPath{.+}', './index');
};
