export default (router) => {
    router.get('/cs/match', './cs/match');
    router.get('/jw', './jw');
    router.get('/library', './library');
    router.get('/physics-school-announcements', './physics-school-announcements-and-news'.announcementsRouter);
    router.get('/physics-school-news', './physics-school-announcements-and-news'.newsRouter);
    router.get('/physics-school-research-news', './physics-school-announcements-and-news'.researchNewsRouter);
    router.get('/ss', './ss');
    router.get('/yjs', './yjs');
};
