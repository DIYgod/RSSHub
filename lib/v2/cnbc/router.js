module.exports = (router) => {
    router.get('/rss/:id?', require('./rss'));
};
