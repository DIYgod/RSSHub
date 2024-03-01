export default (router) => {
    router.get('/community', './community');
    router.get('/datasets', './datasets');
    router.get('/models', './models');
    router.get('/studios', './studios');
};
