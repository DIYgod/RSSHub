module.exports = (router) => {
    router.get('/app/:appId/:appSlug?', require('./app'));
};
