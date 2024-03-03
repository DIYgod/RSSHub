export default (router) => {
    router.get('/app/:appId/:appSlug?', './app');
};
