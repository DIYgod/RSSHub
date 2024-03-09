export default (router) => {
    router.get('/', './index');
    router.get('/tag/:tag', './tag');
};
