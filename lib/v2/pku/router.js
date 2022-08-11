module.exports = function (router) {
    router.get('/admission/sszs', require('./pkuyjs'));
    router.get('/bbs/hot', require('./bbs/hot'));
    router.get('/cls/lecture', require('./cls/lecture'));
    router.get('/eecs/:type?', require('./eecs'));
    router.get('/hr/:category?', require('./hr'));
    router.get('/nsd/gd', require('./nsd'));
    router.get('/rccp/mzyt', require('./rccp/mzyt'));
    router.get('/scc/recruit/:type?', require('./scc/recruit'));
    router.get('/ss/notice', require('./ss/notice.js'));
    router.get('/ss/admission', require('./ss/admission.js'));
    router.get('/ss/pgadmin', require('./ss/pg_admin.js'));
};
