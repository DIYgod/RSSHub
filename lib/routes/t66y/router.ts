export default (router) => {
    router.get('/post/:tid', './post');
    router.get('/:id/:type?', './index');
};
