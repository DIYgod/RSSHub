export default (router) => {
    router.get('/topic/:topic?/:type?', './topic');
};
