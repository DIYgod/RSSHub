module.exports = function (router) {
    router.get('/users/:username?/:type?', require('./index'));
    router.get('/subscriptions', require('./subscriptions'));
};
