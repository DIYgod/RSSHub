module.exports = (router) => {
    router.get('/daily', require('./daily'));
    router.get('/player_news/:id', require('./player_news'));
    router.get('/result/:team', require('./result'));
    router.get('/special/:id', require('./special'));
    router.get('/team_news/:team', require('./team_news'));
    router.get('/top_news/:id?', require('./top_news'));
};
