module.exports = function (router) {
    router.get('/xxgk/:category', require('./xxgk'));
    router.get('/:channel/:category', require('./index'));
};
