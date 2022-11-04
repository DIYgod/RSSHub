module.exports = function (router) {
    router.get('/info/:category?', require('./info')); // news, biography
    router.get('/live', require('./live'));
    router.get('/media', require('./media'));
};
