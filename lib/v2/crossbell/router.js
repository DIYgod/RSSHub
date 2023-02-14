module.exports = function (router) {
    router.get('/notes/character/:characterId', require('./notes/character'));
    router.get('/notes/source/:source', require('./notes/source'));
    router.get('/notes', require('./notes/index'));
    router.get('/feeds/following/:characterId', require('./feeds/following'));
};
