module.exports = (router) => {
    router.get('/counterstrike/matches/:team', require('./cs_matches.js'));
    router.get('/dota2/matches/:id', require('./dota2_matches.js'));
};
