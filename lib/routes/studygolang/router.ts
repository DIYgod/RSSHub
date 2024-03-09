export default (router) => {
    router.get('/go/:id?', './go');
    router.get('/jobs', './jobs');
    router.get('/weekly', './weekly');
};
