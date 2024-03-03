export default (router) => {
    router.get('/models', './models');
    router.get('/discussions/:modelId', './discussions');
};
