export default (router) => {
    router.get('/curations', './curations');
    router.get('/live/:id', './live');
    router.get('/projects', './projects');
    router.get('*', './index');
};
