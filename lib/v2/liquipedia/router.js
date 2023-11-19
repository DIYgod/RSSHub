module.exports = (router) => {
    router.get('/counterstrike/matches/:team', require('./cs_matches'));
};
