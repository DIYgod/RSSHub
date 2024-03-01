export default (router) => {
    router.get('/versions/:pkg/:region?', './versions');
};
