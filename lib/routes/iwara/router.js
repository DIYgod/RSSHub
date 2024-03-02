export default (router) => {
    router.get('/users/:username?/:type?', './index');
    router.get('/subscriptions', './subscriptions');
};
