module.exports = function (router) {
    router.get('/xxgk/:category', require('./xxgk'));
    router.get('/zdyz/:category', require('./zdyz'));
    router.get('/:channel/:category', require('./index'));
};
