module.exports = (router) => {
    router.get('/qq/sdk/changelog/:platform', require('./qq/sdk/changelog'));
};
