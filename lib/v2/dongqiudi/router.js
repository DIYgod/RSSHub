module.exports = (router) => {
    router.redirect('/daily', '/dongqiudi/special/48');
    router.get('/player_news/:id', require('./player_news'));
    router.get('/result/:team', require('./result'));
    router.get('/special/:id', require('./special'));
    router.get('/team_news/:team', require('./team_news'));
    router.get('/top_news/:id?', require('./top_news'));
};
