export default (router) => {
    router.get('/podcasts', './podcasts');
    router.get('/', './index');
};
