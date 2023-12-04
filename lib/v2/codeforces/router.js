module.exports = function (router) {
    router.get('/contests', require('./contests'));
    router.get('/recent-actions/:minrating?', require('./recent_actions'));
};
