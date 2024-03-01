export default (router) => {
    router.get('/admission/sszs', './pkuyjs');
    router.get('/bbs/hot', './bbs/hot');
    router.get('/cls/announcement', './cls/announcement');
    router.get('/cls/lecture', './cls/lecture');
    router.get('/eecs/:type?', './eecs');
    router.get('/hr/:category?', './hr');
    router.get('/nsd/gd', './nsd');
    router.get('/rccp/mzyt', './rccp/mzyt');
    router.get('/scc/recruit/:type?', './scc/recruit');
    router.get('/ss/notice', './ss/notice.js');
    router.get('/ss/admission', './ss/admission.js');
    router.get('/ss/pgadmin', './ss/pg-admin.js');
};
