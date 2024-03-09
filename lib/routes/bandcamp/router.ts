export default (router) => {
    router.get('/tag/:tag?', './tag');
    router.get('/live', './live');
    router.get('/weekly', './weekly');
};
