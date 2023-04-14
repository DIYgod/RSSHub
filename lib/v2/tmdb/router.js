module.exports = (router) => {
    router.get('/collection/:id/:lang?', require('./collection'));
    router.get('/trending/:mediaType/:timeWindow/:lang?', require('./trending'));
    router.get('/tv/:id/seasons/:lang?', require('./seasons'));
    router.get('/tv/:id/seasons/:seasonNumber/episodes/:lang?', require('./episodes'));
    router.get('/:mediaType/:sheet/:lang?', require('./sheet'));
};
