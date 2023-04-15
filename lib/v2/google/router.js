module.exports = function (router) {
    router.get('/album/:id', require('./album'));
    router.get('/citations/:id', require('./citations'));
    router.get('/doodles/:language?', require('./doodles'));
    router.get('/fonts/:sort?', require('./fonts'));
    router.get('/news/:category/:locale', require('./news'));
    router.get('/scholar/:query', require('./scholar'));
    router.get('/sites/recentChanges/:id', require('./sitesRecentChanges'));
    router.get('/sites/:id', require('./sites'));
};
