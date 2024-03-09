export default (router) => {
    router.get('/channel/:id?', './channel');
    router.get('/hot', './hot');
    router.get('/issue/:id?', './issue');
    router.get('/latest', './latest');
    router.get('/tag/:id?', './tag');
    router.get('/zone/:id?', './zone');
};
