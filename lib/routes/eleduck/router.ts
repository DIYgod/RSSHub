export default (router) => {
    router.get('/jobs', './jobs');
    router.get('/posts/:id?', './posts');
};
