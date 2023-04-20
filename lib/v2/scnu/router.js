module.exports = (router) => {
    router.get('/cs/match', require('./cs/match'));
    router.get('/jw', require('./jw'));
    router.get('/library', require('./library'));
    router.get('/physics-school-announcements', require('./physics_school_announcements_and_news').announcementsRouter);
    router.get('/physics-school-news', require('./physics_school_announcements_and_news').newsRouter);
    router.get('/physics-school-research-news', require('./physics_school_announcements_and_news').researchNewsRouter);
    router.get('/ss', require('./ss'));
    router.get('/yjs', require('./yjs'));
};
