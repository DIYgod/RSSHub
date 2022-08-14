module.exports = function (router) {
    router.get('/authors/:authorid/:sort?', require('./main'));
    router.get('/characters/:characterid/:sort?', require('./main'));
    router.get('/origins/:originid/:sort?', require('./main'));
    router.get('/search/:keyword/:sort?', require('./main'));
    router.get('/tags/:tagid/:sort?', require('./main'));
};
