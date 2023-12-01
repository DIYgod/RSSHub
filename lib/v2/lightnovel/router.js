module.exports = function (router) {
    router.get('/:type/:keywords/:security_key', require('./lightNovel'));
};
