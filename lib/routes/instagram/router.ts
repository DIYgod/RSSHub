export default (router) => {
    router.get('/:category/:key', './private-api/index');
    router.get('/2/:category/:key', './web-api/index');
};
