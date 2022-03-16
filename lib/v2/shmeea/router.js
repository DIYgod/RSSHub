module.exports = function (router) {
    router.get('/', require('./index'));
    router.get('/self-study', require('./self-study'));
};
