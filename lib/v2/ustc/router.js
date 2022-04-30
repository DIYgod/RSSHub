module.exports = function (router) {
    router.get('/news/:type?', require('./index'));
    router.get('/jwc/:type?', require('./jwc'));
    router.get('/job/:category?', require('./job'));
    router.get('/gs/:type?', require('./gs'));
    router.get('/sist/:type?', require('./sist'));
    router.get('/eeis/:type?', require('./eeis'));
};
