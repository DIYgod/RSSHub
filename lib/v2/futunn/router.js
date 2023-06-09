module.exports = function (router) {
    router.get('/highlights', require('./main'));
    router.get('/main', require('./main'));
    router.get('/', require('./main'));
};
