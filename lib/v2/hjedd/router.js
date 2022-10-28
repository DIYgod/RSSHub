module.exports = function (router) {
    router.get('/event', require('./article'));
    router.get('/hot', require('./hot'));
    router.get('/latest', require('./latest'));
    router.get('/news', require('./news'));
    router.get('/notice', require('./notice'));
    router.get('/original', require('./original'));
    router.get('/top', require('./top'));
    router.get('/:node?/:type?', require('./article'));
};
