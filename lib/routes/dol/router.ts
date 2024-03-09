export default (router) => {
    router.get('/announce/:owner?/:province?/:office?', './announce');
};
