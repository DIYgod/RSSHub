module.exports = function (router) {
    router.get('/authors/:authorid/:sort/:pagelimit?', require('./main'));
    router.get('/characters/:characterid/:sort/:pagelimit?', require('./main'));
    router.get('/origins/:originid/:sort/:pagelimit?', require('./main'));
    router.get('/search/:keyword/:sort/:pagelimit?', require('./main'));
    router.get('/tags/:tagid/:sort/:pagelimit?', require('./main'));
};
