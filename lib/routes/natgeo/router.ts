export default (router) => {
    router.get('/dailyphoto', './dailyphoto');
    router.get('/dailyselection', './dailyselection');
    router.get('/:cat/:type?', './natgeo');
};
