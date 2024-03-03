export default (router) => {
    router.get('/it/postgraduate', './it-postgraduate');
    router.get('/it/tx/:id?', './it-tx');
    router.get('/it/:type?', './it');
    router.get('/jwc', './jwc');
    router.get('/jwgl', './jwgl');
    router.get('/yjs', './yjs');
};
