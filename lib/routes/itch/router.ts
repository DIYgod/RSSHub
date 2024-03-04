export default (router) => {
    router.get('/devlog/:user/:id', './devlog');
    router.get('/posts/:topic/:id', './posts');
    router.get('*', './index');
};
