export default (router) => {
    router.get('/preferential', './preferential');
    router.get('/creditcard/:bank', './creditcard');
};
