module.exports = (router) => {
    router.get('/models', require('./models'));
    router.get('/discussions/:modelId', require('./discussions'));
};
