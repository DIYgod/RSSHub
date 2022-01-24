module.exports = function (router) {
    router.get('/citations/:id', require('./citations'));
    router.get('/scholar/:query', require('./scholar'));
    router.get('/doodles/:language?', require('./doodles'));
    router.get('/album/:id', require('./album'));
    router.get('/sites/:id', require('./sites'));
    router.get('/fonts/:sort?', require('./fonts'));
};
