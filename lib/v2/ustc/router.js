module.exports = function (router) {
    router.get('/eeis/:type?', require('./eeis'));
    router.get('/gs/:type?', require('./gs'));
    router.get('/job/:category?', require('./job'));
    router.get('/jwc/:type?', require('./jwc'));
    router.get('/news/:type?', require('./index'));
    router.get('/sist/:type?', require('./sist'));
};
