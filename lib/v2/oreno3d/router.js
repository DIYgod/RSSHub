module.exports = function (router) {
    router.get('/authors/:sort?/:authorid', require('./authors'));
    router.get('/characters/:sort?/:characterid', require('./characters'));
    router.get('/origins/:sort?/:originid', require('./origins'));
    router.get('/search/:sort?/:keyword', require('./search'));
    router.get('/tags/:sort?/:tagid', require('./tags'));
};
