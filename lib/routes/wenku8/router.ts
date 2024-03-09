export default (router) => {
    router.get('/chapter/:id', './chapter');
    router.get('/volume/:id', './volume');
    router.get('/:category?', './index');
};
