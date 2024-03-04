export default (router) => {
    router.get('/authors/:authorid/:sort/:pagelimit?', './main');
    router.get('/characters/:characterid/:sort/:pagelimit?', './main');
    router.get('/origins/:originid/:sort/:pagelimit?', './main');
    router.get('/search/:keyword/:sort/:pagelimit?', './main');
    router.get('/tags/:tagid/:sort/:pagelimit?', './main');
};
