module.exports = (router) => {
    router.get('/models', './models');
    router.get('/discussions/:modelId', './discussions');
};
