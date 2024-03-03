export default (router) => {
    router.get('/blog/:maxPage?', './blog');
};
