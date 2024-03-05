export default (router) => {
    router.get('/bulletin/:category?', './bulletin');
    router.get('/cas/:category?', './cas');
    router.get('/jwc/:category?', './jwc');
    router.get('/lib', './library/lib');
    router.get('/scs/:category?', './scs');
    router.get('/sese/:category?', './sese');
    router.get('/xgc', './xgc');
    router.get('/yjs/*', './yjs');
};
