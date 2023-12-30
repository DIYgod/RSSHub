module.exports = function (router) {
    router.get('/podcasts', require('./podcasts'));
    router.get('/', require('./index'));
};
