export default (router) => {
    router.get('/jwc/bkjw/:category?', './jwc/bkjw.js');
    router.get('/jwc/yjjw/:category?', './jwc/yjs.js');
};
