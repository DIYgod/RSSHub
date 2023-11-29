module.exports = function (router) {
    router.get('/:type/:security_key/:keywords', require('./lightNovel'));
};
