module.exports = (router) => {
    router.get('/physics-school-announcements', require('./physics_school_announcements_and_news').announcementsRouter);
    router.get('/physics-school-news', require('./physics_school_announcements_and_news').newsRouter);
    router.get('/physics-school-research-news', require('./physics_school_announcements_and_news').researchNewsRouter);
};
