module.exports = (router) => {
    router.get('/counterstrike/matches/:team', require('./cs-matches.js'));
    router.get('/dota2/matches/:id', require('./dota2-matches.js'));
};
