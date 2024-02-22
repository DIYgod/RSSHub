module.exports = (router) => {
    router.get('/lives/:category?', require('./lives'));
    router.get('/timeline/:category?', require('./timeline'));
    router.get('/:category?', require('./catalogue'));
};
