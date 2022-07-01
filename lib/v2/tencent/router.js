module.exports = (router) => {
    router.get('/qq/sdk/changelog/:platform', require('./qq/sdk/changelog'));
    router.get('/cloud/column/:id?/:tag?', require('./cloud/column'));
};
