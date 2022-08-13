module.exports = function (router) {
    router.get('/search/:sort?/:keyword', require('./search'));
    router.get('/characters/:sort?/:characterid', require('./characters'));
    router.get('/authors/:sort?/:authorid', require('./authors'));
    router.get('/tags/:sort?/:tagid', require('./tags'));
    router.get('/origins/:sort?/:originid', require('./origins'));
};
