export default (router) => {
    router.get('/user/:name', './user');
    router.get('/:type/:name', './community');
};
