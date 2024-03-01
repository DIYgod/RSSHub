export default (router) => {
    router.get('/blog/:cate?/:language?', './blog');
    router.get('/changelog/:language?', './changelog');
};
