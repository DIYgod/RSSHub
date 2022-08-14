module.exports = function (router) {
    router.get('/authors/:authorid/:sort?', require('./authors'));
    router.get('/characters/:characterid/:sort?', require('./characters'));
    router.get('/origins/:originid/:sort?', require('./origins'));
    router.get('/search/:keyword/:sort?', require('./search'));
    router.get('/tags/:tagid/:sort?', require('./tags'));
};
