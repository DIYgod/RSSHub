module.exports = (router) => {
    router.get('/dailyphoto', require('./dailyphoto'));
    router.get('/dailyselection', require('./dailyselection'));
    router.get('/:cat/:type?', require('./natgeo'));
};
