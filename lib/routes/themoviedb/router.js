export default (router) => {
    router.get('/collection/:id/:lang?', './collection');
    router.get('/trending/:mediaType/:timeWindow/:lang?', './trending');
    router.get('/tv/:id/seasons/:lang?', './seasons');
    router.get('/tv/:id/seasons/:seasonNumber/episodes/:lang?', './episodes');
    router.get('/:mediaType/:sheet/:lang?', './sheet');
};
