module.exports = function (router) {
    router.get('/html_clip/:user/:tag', require('./index'));
    router.get('/rss/:user/:tag', require('./rss'));
};
