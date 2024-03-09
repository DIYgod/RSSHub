export default (router) => {
    router.get('/letters/:author', './letter');
    router.get('/posts/:author', './post');
};
