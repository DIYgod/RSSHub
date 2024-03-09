export default (router) => {
    router.get('/counterstrike/matches/:team', './cs-matches.js');
    router.get('/dota2/matches/:id', './dota2-matches.js');
};
