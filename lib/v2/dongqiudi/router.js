module.exports = (router) => {
    router.get('/daily', (c) => c.redirect('/dongqiudi/special/48'));
    router.get('/player_news/:id', './player-news');
    router.get('/result/:team', './result');
    router.get('/special/:id', './special');
    router.get('/team_news/:team', './team-news');
    router.get('/top_news/:id?', './top-news');
};
