module.exports = (router) => {
    router.get('/dailyselection', require('./dailyselection'));
    router.get('/dailyphoto', require('./dailyphoto'));
    router.get('/:cat/:type?', require('./natgeo'));
};
