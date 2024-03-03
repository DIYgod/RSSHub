export default (router) => {
    router.get('/blog/:language?', './blog');
};
