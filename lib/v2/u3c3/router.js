module.exports = function (router) {
    router.get('/search/:keyword/:preview?', require('./index'));
    router.get('/:type?/:preview?', require('./index'));
};
