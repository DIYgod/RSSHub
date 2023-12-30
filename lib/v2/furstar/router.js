module.exports = function (router) {
    router.get('/characters/:lang?', require('./index'));
    router.get('/artists/:lang?', require('./artists'));
    router.get('/archive/:lang?', require('./archive'));
};
