export default (router) => {
    router.get('/daily', './daily');
    router.get('/player_news/:id', './player-news');
    router.get('/result/:team', './result');
    router.get('/special/:id', './special');
    router.get('/team_news/:team', './team-news');
    router.get('/top_news/:id?', './top-news');
};
