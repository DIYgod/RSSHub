export default (router) => {
    router.get('/cs/match', './cs/match');
    router.get('/jw', './jw');
    router.get('/library', './library');
    router.get('/physics-school-announcements', './announcements-router');
    router.get('/physics-school-news', './news-router');
    router.get('/physics-school-research-news', './research-news-router');
    router.get('/ss', './ss');
    router.get('/yjs', './yjs');
};
