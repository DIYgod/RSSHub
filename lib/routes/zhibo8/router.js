export default (router) => {
    router.get('/forum/:id', './forum');
    router.get('/luxiang/:category?', './luxiang');
    router.get('/more/:category?', './more');
    router.get('/post/:id', './post');
};
