module.exports = (router) => {
    router.get('/physics-school-announcements', require('./physics_school_announcements_and_news').announcements_router);
    router.get('/physics-school-news', require('./physics_school_announcements_and_news').news_router);
    router.get('/physics-school-research-news', require('./physics_school_announcements_and_news').research_news_router);
};
