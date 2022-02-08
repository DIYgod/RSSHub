module.exports = function (router) {
    router.get('/search/:filter?/:needDetails?', require('./index'));
    router.get('/:filter?/:needDetails?', require('./index'));
};
