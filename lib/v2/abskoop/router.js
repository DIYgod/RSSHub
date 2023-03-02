module.exports = function (router) {
    router.get('/', require('./index'));
    router.get('/nsfw', require('./nsfw'));
};
