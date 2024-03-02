export default (router) => {
    router.get('/espresso', './espresso');
    router.get('/global-business-review/:language?', './global-business-review');
    router.get('/:endpoint', './full');
};
