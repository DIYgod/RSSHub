module.exports = function (router) {
    router.get('/top20', require('./top20'));
    router.get('/:id', require('./index'));
};
